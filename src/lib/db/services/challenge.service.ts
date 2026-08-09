import { challengeRepository } from "../repository/challenge.repository";
import { nowIso, todayDateKey } from "../utils/id";
import type { ChallengeRecord } from "../models";

export interface StartChallengeInput {
  /** Id/slug challenge, mis. "30-hari-doa-konsisten". */
  id: string;
  title: string;
  totalDays: number;
  /** Default: sekarang. */
  startedAt?: string;
}

/** Layer bisnis untuk fitur Challenge (mis. "Challenge 30 Hari Doa Konsisten"). */
export const challengeService = {
  async list(): Promise<ChallengeRecord[]> {
    const all = await challengeRepository.getAll();
    return all.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  },

  async get(id: string): Promise<ChallengeRecord | undefined> {
    return challengeRepository.getById(id);
  },

  /** Mulai/daftar ulang sebuah challenge — menimpa progres lama bila id sama. */
  async start(input: StartChallengeInput): Promise<ChallengeRecord> {
    const timestamp = nowIso();
    const record: ChallengeRecord = {
      id: input.id,
      title: input.title,
      totalDays: input.totalDays,
      startedAt: input.startedAt ?? timestamp,
      checkIns: {},
      updatedAt: timestamp,
    };
    await challengeRepository.put(record);
    return record;
  },

  /** Tandai satu tanggal sebagai selesai/tidak untuk sebuah challenge (default hari ini). */
  async checkIn(
    id: string,
    date: string = todayDateKey(),
    completed = true
  ): Promise<ChallengeRecord> {
    const record = await challengeRepository.requireById(id);
    const updated: ChallengeRecord = {
      ...record,
      checkIns: { ...record.checkIns, [date]: completed },
      updatedAt: nowIso(),
    };
    await challengeRepository.put(updated);
    return updated;
  },

  async remove(id: string): Promise<void> {
    await challengeRepository.delete(id);
  },

  /** Persentase hari yang sudah dicentang selesai dari total hari challenge. */
  getProgressPercent(record: ChallengeRecord): number {
    if (record.totalDays === 0) return 0;
    const completedDays = Object.values(record.checkIns).filter(Boolean).length;
    return Math.min(100, Math.round((completedDays / record.totalDays) * 100));
  },
};
