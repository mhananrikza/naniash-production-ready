import { BaseRepository } from "./base.repository";
import type { ReminderRecord, ReminderType } from "../models";

export class ReminderRepository extends BaseRepository<ReminderRecord> {
  constructor() {
    super("reminder");
  }

  findByType(type: ReminderType): Promise<ReminderRecord[]> {
    return this.getByIndex("type", type);
  }
}

export const reminderRepository = new ReminderRepository();
