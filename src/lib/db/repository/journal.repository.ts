import { BaseRepository } from "./base.repository";
import type { JournalRecord } from "../models";

export class JournalRepository extends BaseRepository<JournalRecord> {
  constructor() {
    super("journal");
  }

  findByDate(date: string): Promise<JournalRecord[]> {
    return this.getByIndex("date", date);
  }
}

export const journalRepository = new JournalRepository();
