import { settingsService } from "./settings.service";
import { isValidTimeString } from "@/services/reminder-engine/time";
import type { ReminderEngineSettings } from "@/services/reminder-engine/types";

/** Key penyimpanan di store `settings` (key-value generik, lihat `settings.service.ts`). */
const SETTINGS_KEY = "reminderEngine";

const DEFAULT_SETTINGS: ReminderEngineSettings = {
  morningTime: "05:00",
  eveningTime: "20:00",
  doaReminderEnabled: true,
  journalReminderEnabled: true,
};

function assertValidPatch(patch: Partial<ReminderEngineSettings>): void {
  if (patch.morningTime !== undefined && !isValidTimeString(patch.morningTime)) {
    throw new Error(`"morningTime" harus format 24 jam "HH:mm", diterima: "${patch.morningTime}".`);
  }
  if (patch.eveningTime !== undefined && !isValidTimeString(patch.eveningTime)) {
    throw new Error(`"eveningTime" harus format 24 jam "HH:mm", diterima: "${patch.eveningTime}".`);
  }
}

/**
 * Settings Service — Reminder Engine.
 *
 * Menyimpan preferensi reminder (waktu pagi, waktu malam, aktif/nonaktif
 * reminder membaca doa & reminder journal) di IndexedDB lewat store
 * `settings` (key-value generik yang sama dipakai fitur lain, lihat
 * `settings.service.ts`), di bawah satu key `"reminderEngine"`.
 *
 * Dipisah dari `settingsService` generik supaya pemanggil dapat tipe kuat
 * (`ReminderEngineSettings`), nilai default yang masuk akal, dan validasi
 * format waktu — tanpa perlu tahu key penyimpanan mentahnya.
 *
 * Reminder Service (`reminder-engine.service.ts`) membaca lewat `get()`
 * setiap kali menyegarkan jadwal, jadi perubahan di sini baru berlaku
 * setelah `reminderEngineService.syncSchedule()`/`.start()` dipanggil lagi.
 */
export const reminderSettingsService = {
  async get(): Promise<ReminderEngineSettings> {
    return settingsService.get<ReminderEngineSettings>(SETTINGS_KEY, DEFAULT_SETTINGS);
  },

  /** Update sebagian field, sisanya dipertahankan dari nilai tersimpan saat ini. */
  async update(patch: Partial<ReminderEngineSettings>): Promise<ReminderEngineSettings> {
    assertValidPatch(patch);
    const current = await reminderSettingsService.get();
    const next: ReminderEngineSettings = { ...current, ...patch };
    await settingsService.set(SETTINGS_KEY, next);
    return next;
  },

  async reset(): Promise<ReminderEngineSettings> {
    await settingsService.set(SETTINGS_KEY, DEFAULT_SETTINGS);
    return DEFAULT_SETTINGS;
  },

  /** Salinan nilai default — berguna untuk UI (nanti) yang butuh placeholder tanpa `await`. */
  defaults(): ReminderEngineSettings {
    return { ...DEFAULT_SETTINGS };
  },
};
