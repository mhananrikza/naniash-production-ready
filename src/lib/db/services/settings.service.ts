import { settingsRepository } from "../repository/settings.repository";
import { nowIso } from "../utils/id";
import type { SettingsRecord } from "../models";

/**
 * Layer bisnis key-value generik untuk preferensi aplikasi (mis. tema,
 * ukuran font baca, status onboarding). Dipakai lewat `get`/`set` bertipe
 * generic supaya pemanggil tidak perlu tahu bentuk penyimpanan di baliknya.
 */
export const settingsService = {
  async get<T>(key: string, fallback: T): Promise<T> {
    const record = await settingsRepository.getById(key);
    return record ? (record.value as T) : fallback;
  },

  async set<T>(key: string, value: T): Promise<SettingsRecord<T>> {
    const record: SettingsRecord<T> = { key, value, updatedAt: nowIso() };
    await settingsRepository.put(record as SettingsRecord);
    return record;
  },

  async remove(key: string): Promise<void> {
    await settingsRepository.delete(key);
  },

  async getAll(): Promise<SettingsRecord[]> {
    return settingsRepository.getAll();
  },
};
