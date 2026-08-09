import { BaseRepository } from "./base.repository";
import type { ReminderScheduleRecord } from "../models";

/**
 * Repository untuk store `reminderSchedule` — jadwal berikutnya milik
 * Reminder Engine (2 record tetap: "doa" & "journal"). Lihat
 * `ReminderScheduleRecord` di `../models.ts` dan
 * `../services/reminder-engine.service.ts` untuk logika bisnisnya.
 */
export class ReminderScheduleRepository extends BaseRepository<ReminderScheduleRecord> {
  constructor() {
    super("reminderSchedule");
  }
}

export const reminderScheduleRepository = new ReminderScheduleRepository();
