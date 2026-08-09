import { reminderRepository } from "../repository/reminder.repository";
import { createId, nowIso } from "../utils/id";
import type { ReminderRecord, ReminderType } from "../models";

export interface ReminderInput {
  type: ReminderType;
  title: string;
  /** Format 24 jam "HH:mm". */
  time: string;
  /** 0 = Minggu … 6 = Sabtu. */
  days: number[];
  /** Default: true. */
  enabled?: boolean;
}

/** Layer bisnis untuk pengingat (doa, tirakat, jurnal, custom). */
export const reminderService = {
  /** Daftar pengingat, opsional difilter per tipe, diurutkan berdasarkan jam. */
  async list(type?: ReminderType): Promise<ReminderRecord[]> {
    const all = type ? await reminderRepository.findByType(type) : await reminderRepository.getAll();
    return all.sort((a, b) => a.time.localeCompare(b.time));
  },

  async create(input: ReminderInput): Promise<ReminderRecord> {
    const timestamp = nowIso();
    const record: ReminderRecord = {
      id: createId(),
      type: input.type,
      title: input.title,
      time: input.time,
      days: input.days,
      enabled: input.enabled ?? true,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    await reminderRepository.put(record);
    return record;
  },

  async update(id: string, patch: Partial<ReminderInput>): Promise<ReminderRecord> {
    const existing = await reminderRepository.requireById(id);
    const updated: ReminderRecord = { ...existing, ...patch, updatedAt: nowIso() };
    await reminderRepository.put(updated);
    return updated;
  },

  async toggle(id: string): Promise<ReminderRecord> {
    const existing = await reminderRepository.requireById(id);
    return reminderService.update(id, { enabled: !existing.enabled });
  },

  async remove(id: string): Promise<void> {
    await reminderRepository.delete(id);
  },
};
