import { progressRepository } from "../repository/progress.repository";
import { nowIso, todayDateKey } from "../utils/id";
import type { DailyProgressRecord } from "../models";

/**
 * Layer bisnis untuk checklist "Progress Hari Ini" di Home (doa pagi,
 * tirakat, afirmasi, jurnal, dst.). Satu record per tanggal, berisi map
 * itemId -> status selesai/tidak.
 */
export const progressService = {
  async getByDate(date: string): Promise<DailyProgressRecord | undefined> {
    return progressRepository.getById(date);
  },

  async getToday(): Promise<DailyProgressRecord | undefined> {
    return progressService.getByDate(todayDateKey());
  },

  /** Set status satu item checklist untuk tanggal tertentu (default hari ini). */
  async setItem(
    itemId: string,
    done: boolean,
    date: string = todayDateKey()
  ): Promise<DailyProgressRecord> {
    const existing = await progressRepository.getById(date);
    const timestamp = nowIso();
    const record: DailyProgressRecord = existing ?? { id: date, items: {}, updatedAt: timestamp };

    record.items = { ...record.items, [itemId]: { done, updatedAt: timestamp } };
    record.updatedAt = timestamp;

    await progressRepository.put(record);
    return record;
  },

  async toggleItem(itemId: string, date: string = todayDateKey()): Promise<DailyProgressRecord> {
    const existing = await progressRepository.getById(date);
    const currentlyDone = existing?.items[itemId]?.done ?? false;
    return progressService.setItem(itemId, !currentlyDone, date);
  },

  /** Ambil semua record dalam rentang tanggal (inklusif), diurutkan naik. */
  async getRange(startDate: string, endDate: string): Promise<DailyProgressRecord[]> {
    const all = await progressRepository.getAll();
    return all
      .filter((record) => record.id >= startDate && record.id <= endDate)
      .sort((a, b) => a.id.localeCompare(b.id));
  },

  /** Persentase item yang sudah selesai untuk satu record. */
  getCompletionPercent(record: DailyProgressRecord | undefined): number {
    if (!record) return 0;
    const states = Object.values(record.items);
    if (states.length === 0) return 0;
    const doneCount = states.filter((state) => state.done).length;
    return Math.round((doneCount / states.length) * 100);
  },
};
