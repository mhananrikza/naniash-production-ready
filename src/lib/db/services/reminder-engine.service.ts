import { reminderScheduleRepository } from "../repository/reminder-schedule.repository";
import { reminderSettingsService } from "./reminder-settings.service";
import { nowIso } from "../utils/id";
import { computeNextFireAt, millisUntil, notificationService } from "@/services/reminder-engine";
import type { ReminderKind, ReminderEngineSettings, ReminderEngineStatus } from "@/services/reminder-engine";
import type { ReminderScheduleRecord } from "../models";

/**
 * Reminder Service — Reminder Engine.
 *
 * Orkestrator utama: menghubungkan Settings Service
 * (`reminder-settings.service.ts`), perhitungan jadwal murni
 * (`computeNextFireAt` di `@/services/reminder-engine`), penyimpanan
 * jadwal (store `reminderSchedule`), dan Notification Service
 * (`@/services/reminder-engine`).
 *
 * Cara kerja singkat:
 * 1. `start()`/`syncSchedule()` membaca `ReminderEngineSettings` sekali,
 *    lalu untuk tiap jenis ("doa" pakai `morningTime`, "journal" pakai
 *    `eveningTime") menghitung kejadian berikutnya dan menyimpannya ke
 *    `reminderSchedule` — jadwal SELALU tersimpan di sini terlepas dari
 *    apakah Notification API didukung atau tidak.
 * 2. Sebuah `setTimeout` in-memory dipasang untuk tiap jenis yang aktif.
 *    Saat jatuh tempo, `notificationService.show()` dipanggil (yang akan
 *    diam-diam tidak menampilkan apa pun bila browser tidak mendukung/
 *    belum mengizinkan Notification API — lihat `notification.service.ts`),
 *    `lastFiredAt` dicatat, lalu dijadwalkan ulang untuk kejadian
 *    berikutnya (besok).
 *
 * Berjalan LOKAL & berbasis timer tab — pemanggil (mis. `providers.tsx`)
 * perlu memanggil `start()` sekali setelah mount di client supaya jadwal
 * aktif untuk sesi berjalan; ini sengaja tidak otomatis dari sini supaya
 * modul ini tetap bebas dari React lifecycle (tidak ada UI di sini, sesuai
 * kebutuhan). Karena berbasis `setTimeout` di tab, reminder tidak akan
 * berbunyi saat tab benar-benar tertutup — begitu tab dibuka lagi,
 * `start()` menghitung ulang jadwal dari waktu saat itu (jadwal lama yang
 * sudah lewat otomatis digeser ke kejadian berikutnya, bukan ditembakkan
 * beruntun/"catch-up").
 */

const KINDS: ReminderKind[] = ["doa", "journal"];

const MESSAGES: Record<ReminderKind, { title: string; body: string }> = {
  doa: {
    title: "Waktunya membaca doa",
    body: "Yuk luangkan waktu sebentar untuk membaca doa pagi ini.",
  },
  journal: {
    title: "Waktunya menulis journal",
    body: "Refleksikan harimu lewat journal sebelum istirahat malam ini.",
  },
};

/** Timer in-memory per jenis — hidup selama tab terbuka, tidak persisten (jadwalnya sendiri yang persisten, lihat store `reminderSchedule`). */
const timers = new Map<ReminderKind, ReturnType<typeof setTimeout>>();

function clearTimer(kind: ReminderKind): void {
  const existing = timers.get(kind);
  if (existing !== undefined) {
    clearTimeout(existing);
    timers.delete(kind);
  }
}

function resolveKindConfig(settings: ReminderEngineSettings, kind: ReminderKind): { enabled: boolean; time: string } {
  return kind === "doa"
    ? { enabled: settings.doaReminderEnabled, time: settings.morningTime }
    : { enabled: settings.journalReminderEnabled, time: settings.eveningTime };
}

/** Simpan/segarkan satu jenis reminder: hitung jadwal, tulis ke IndexedDB, pasang timer. Selalu menulis record (juga saat nonaktif) supaya status "nonaktif" ikut tersimpan, bukan sekadar dihapus. */
async function scheduleKind(kind: ReminderKind, enabled: boolean, time: string): Promise<void> {
  clearTimer(kind);

  const existing = await reminderScheduleRepository.getById(kind);

  if (!enabled) {
    const record: ReminderScheduleRecord = {
      id: kind,
      enabled: false,
      time,
      nextFireAt: null,
      lastFiredAt: existing?.lastFiredAt ?? null,
      updatedAt: nowIso(),
    };
    await reminderScheduleRepository.put(record);
    return;
  }

  const nextFireAt = computeNextFireAt(time);
  const record: ReminderScheduleRecord = {
    id: kind,
    enabled: true,
    time,
    nextFireAt: nextFireAt.toISOString(),
    lastFiredAt: existing?.lastFiredAt ?? null,
    updatedAt: nowIso(),
  };
  await reminderScheduleRepository.put(record);

  const timeoutId = setTimeout(() => {
    void fireReminder(kind);
  }, millisUntil(nextFireAt));
  timers.set(kind, timeoutId);
}

/** Dipanggil saat jadwal sebuah jenis jatuh tempo: tampilkan notifikasi (bila memungkinkan), catat, lalu jadwalkan lagi untuk besok berdasarkan pengaturan TERKINI (bisa saja berubah selagi timer berjalan). */
async function fireReminder(kind: ReminderKind): Promise<void> {
  const settings = await reminderSettingsService.get();
  const { enabled, time } = resolveKindConfig(settings, kind);

  if (!enabled) {
    await scheduleKind(kind, false, time);
    return;
  }

  const message = MESSAGES[kind];
  await notificationService.show(message.title, {
    body: message.body,
    tag: `reminder-${kind}`,
    icon: "/icons/icon-192.png",
  });

  const existing = await reminderScheduleRepository.getById(kind);
  await reminderScheduleRepository.put({
    id: kind,
    enabled: true,
    time,
    nextFireAt: existing?.nextFireAt ?? null,
    lastFiredAt: nowIso(),
    updatedAt: nowIso(),
  });

  // Jadwalkan kejadian berikutnya (besok, jam yang sama).
  await scheduleKind(kind, true, time);
}

export const reminderEngineService = {
  /**
   * Baca Settings Service lalu segarkan jadwal + timer untuk kedua jenis
   * reminder sekaligus. Aman dipanggil berkali-kali (mis. tiap kali
   * pengaturan berubah) — timer lama otomatis diganti, tidak menumpuk.
   */
  async syncSchedule(): Promise<void> {
    const settings = await reminderSettingsService.get();
    await Promise.all(
      KINDS.map((kind) => {
        const { enabled, time } = resolveKindConfig(settings, kind);
        return scheduleKind(kind, enabled, time);
      })
    );
  },

  /** Alias `syncSchedule()` — titik masuk yang dipanggil sekali setelah mount di client (mis. dari `providers.tsx`). */
  async start(): Promise<void> {
    await reminderEngineService.syncSchedule();
  },

  /** Hentikan seluruh timer in-memory (mis. saat "keluar"/hapus data lokal). Jadwal yang SUDAH tersimpan di IndexedDB tidak ikut dihapus — panggil `syncSchedule()` lagi untuk mengaktifkan ulang. */
  stop(): void {
    for (const kind of KINDS) clearTimer(kind);
  },

  /** Seluruh jadwal tersimpan, diurutkan berdasarkan jenis — dipakai untuk debugging/status, bukan ditampilkan langsung sebagai UI. */
  async getSchedule(): Promise<ReminderScheduleRecord[]> {
    const all = await reminderScheduleRepository.getAll();
    return all.sort((a, b) => a.id.localeCompare(b.id));
  },

  /** Status gabungan (pengaturan + jadwal tersimpan) untuk satu jenis reminder. */
  async getStatus(kind: ReminderKind): Promise<ReminderEngineStatus> {
    const [settings, record] = await Promise.all([reminderSettingsService.get(), reminderScheduleRepository.getById(kind)]);
    const { enabled, time } = resolveKindConfig(settings, kind);
    return {
      kind,
      enabled,
      time,
      nextFireAt: record?.nextFireAt ?? null,
      lastFiredAt: record?.lastFiredAt ?? null,
    };
  },

  /** Status gabungan untuk kedua jenis sekaligus. */
  async getAllStatuses(): Promise<ReminderEngineStatus[]> {
    return Promise.all(KINDS.map((kind) => reminderEngineService.getStatus(kind)));
  },
};
