import { dailyJourneyRepository } from "../repository/daily-journey.repository";
import { nowIso, todayDateKey } from "../utils/id";
import { previousDateKey, resolveDailySelection } from "@/services/daily-journey/algorithm";
import type { DailyJourneyPools } from "@/types/daily-journey";
import type { DailyJourneyRecord, DailyJourneySlotName } from "../models";

/**
 * Layer bisnis Daily Journey Engine — satu-satunya tempat yang
 * menghubungkan algoritma pemilihan murni (`@/services/daily-journey`)
 * dengan penyimpanan lokal (IndexedDB store `dailyJourney`, lihat
 * `DailyJourneyRecord` di `../models.ts`).
 *
 * Aturan "tidak boleh sama dua hari berturut-turut", "materi baru tiap
 * hari berdasarkan tanggal kalender (bukan sesi buka-app)", dan "tetap
 * lanjut walau absen beberapa hari" semuanya diimplementasikan di sini
 * lewat `getOrCreateDay` — lihat komentar di dalamnya.
 */

const SLOTS: DailyJourneySlotName[] = ["doa", "dzikir", "afirmasi", "artikel"];

function emptyCompletion(): Record<DailyJourneySlotName, boolean> {
  return { doa: false, dzikir: false, afirmasi: false, artikel: false };
}

export const dailyJourneyService = {
  /** Ambil record tersimpan untuk satu tanggal, TANPA membuat baru bila belum ada. */
  async getByDate(date: string): Promise<DailyJourneyRecord | undefined> {
    return dailyJourneyRepository.getById(date);
  },

  /**
   * Inti Daily Journey Engine: ambil materi untuk satu tanggal, generate
   * baru hanya bila tanggal itu belum pernah di-generate sebelumnya.
   *
   * - Bila record untuk `date` SUDAH ada (mis. pengguna membuka app
   *   berkali-kali di hari yang sama) -> dikembalikan apa adanya. Materi
   *   TIDAK pernah berubah dalam satu hari kalender yang sama, begitu
   *   pula status selesainya tetap terjaga. Ini yang memastikan "kalau
   *   hari sudah selesai, materi baru baru muncul besok" — karena
   *   `date` besok otomatis berbeda dan belum punya record.
   * - Bila BELUM ada (hari baru — baik karena baru pertama kali pakai,
   *   maupun karena baru buka lagi setelah absen sekian hari) -> pilih
   *   materi lewat `resolveDailySelection`, dengan exclude = pilihan
   *   HARI SEBELUMNYA (`date` dikurangi satu), dibaca langsung dari
   *   IndexedDB kalau ada. Fungsi resolusi sendiri sudah menangani kasus
   *   tidak ada record kemarin (pool berubah, atau memang absen sehingga
   *   kemarin tidak pernah dibuka) lewat "pilihan bayangan" deterministik
   *   — lihat `computeShadowPick` di `algorithm.ts`. Karena resolusinya
   *   murni fungsi dari tanggal, TIDAK perlu memutar ulang / mengisi
   *   record untuk setiap hari yang terlewat satu per satu; cukup hitung
   *   langsung untuk tanggal hari ini.
   *
   * @param date  Tanggal target, default hari ini (waktu lokal perangkat).
   * @param pools Id konten per slot — lihat `buildDailyJourneyPools`
   *              (dari `ContentItemMeta[]` di server, atau dari manifest
   *              statis `daily-journey-pool.json` di client).
   */
  async getOrCreateDay(pools: DailyJourneyPools, date: string = todayDateKey()): Promise<DailyJourneyRecord> {
    const existing = await dailyJourneyRepository.getById(date);
    if (existing) return existing;

    const previousRecord = await dailyJourneyRepository.getById(previousDateKey(date));
    const itemIds = resolveDailySelection(pools, date, previousRecord?.itemIds ?? null);

    const timestamp = nowIso();
    const record: DailyJourneyRecord = {
      id: date,
      itemIds,
      completion: emptyCompletion(),
      generatedAt: timestamp,
      completedAt: null,
    };

    await dailyJourneyRepository.put(record);
    return record;
  },

  /** Shortcut `getOrCreateDay` untuk tanggal hari ini. */
  async getToday(pools: DailyJourneyPools): Promise<DailyJourneyRecord> {
    return dailyJourneyService.getOrCreateDay(pools, todayDateKey());
  },

  /**
   * Tandai satu slot selesai/belum untuk tanggal tertentu (default hari
   * ini). Materi hari itu TIDAK diganti — hanya status yang berubah.
   * `completedAt` otomatis terisi begitu keempat slot selesai, dan
   * otomatis dikosongkan lagi begitu salah satu di-uncheck.
   *
   * Melempar `RecordNotFoundError` bila `date` belum pernah di-generate
   * (`getOrCreateDay`/`getToday` belum pernah dipanggil untuk tanggal
   * itu) — pemanggil UI nanti seharusnya selalu memanggil `getToday()`
   * dulu sebelum menandai slot mana pun.
   */
  async setSlotComplete(
    slot: DailyJourneySlotName,
    done: boolean,
    date: string = todayDateKey()
  ): Promise<DailyJourneyRecord> {
    const record = await dailyJourneyRepository.requireById(date);
    record.completion = { ...record.completion, [slot]: done };

    const allDone = SLOTS.every((s) => record.completion[s]);
    record.completedAt = allDone ? (record.completedAt ?? nowIso()) : null;

    await dailyJourneyRepository.put(record);
    return record;
  },

  async toggleSlotComplete(
    slot: DailyJourneySlotName,
    date: string = todayDateKey()
  ): Promise<DailyJourneyRecord> {
    const existing = await dailyJourneyRepository.getById(date);
    const currentlyDone = existing?.completion[slot] ?? false;
    return dailyJourneyService.setSlotComplete(slot, !currentlyDone, date);
  },

  /** `true` bila keempat slot pada `record` sudah ditandai selesai. */
  isCompleted(record: DailyJourneyRecord | undefined): boolean {
    return record?.completedAt != null;
  },

  /** Riwayat pilihan dalam rentang tanggal (inklusif), diurutkan naik — untuk statistik/streak di UI nanti. */
  async getHistory(startDate: string, endDate: string): Promise<DailyJourneyRecord[]> {
    const all = await dailyJourneyRepository.getAll();
    return all
      .filter((record) => record.id >= startDate && record.id <= endDate)
      .sort((a, b) => a.id.localeCompare(b.id));
  },
};
