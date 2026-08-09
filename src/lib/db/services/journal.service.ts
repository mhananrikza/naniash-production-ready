import { journalRepository } from "../repository/journal.repository";
import { createId, nowIso, todayDateKey } from "../utils/id";
import type { JournalRecord } from "../models";

export interface JournalEntryInput {
  /** Default: hari ini. */
  date?: string;
  mood?: string | null;
  moodEmoji?: string | null;
  content: string;
}

/** Layer bisnis untuk fitur Journal di Home & halaman jurnal nanti. */
export const journalService = {
  /** Seluruh entri, terbaru dulu (tanggal, lalu waktu dibuat). */
  async list(): Promise<JournalRecord[]> {
    const all = await journalRepository.getAll();
    return all.sort(
      (a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt)
    );
  },

  async getByDate(date: string): Promise<JournalRecord[]> {
    return journalRepository.findByDate(date);
  },

  async create(input: JournalEntryInput): Promise<JournalRecord> {
    const timestamp = nowIso();
    const record: JournalRecord = {
      id: createId(),
      date: input.date ?? todayDateKey(),
      mood: input.mood ?? null,
      moodEmoji: input.moodEmoji ?? null,
      content: input.content,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    await journalRepository.put(record);
    return record;
  },

  async update(id: string, patch: Partial<JournalEntryInput>): Promise<JournalRecord> {
    const existing = await journalRepository.requireById(id);
    const updated: JournalRecord = {
      ...existing,
      ...(patch.date !== undefined ? { date: patch.date } : {}),
      ...(patch.mood !== undefined ? { mood: patch.mood } : {}),
      ...(patch.moodEmoji !== undefined ? { moodEmoji: patch.moodEmoji } : {}),
      ...(patch.content !== undefined ? { content: patch.content } : {}),
      updatedAt: nowIso(),
    };
    await journalRepository.put(updated);
    return updated;
  },

  async remove(id: string): Promise<void> {
    await journalRepository.delete(id);
  },

  /** Hitung hari beruntun menulis jurnal, mundur dari hari ini hingga rantainya putus. */
  async getStreak(): Promise<number> {
    const entries = await journalService.list();
    const dates = new Set(entries.map((entry) => entry.date));

    let streak = 0;
    const cursor = new Date();
    while (dates.has(todayDateKey(cursor))) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    }
    return streak;
  },
};
