import { BaseRepository } from "./base.repository";
import type { DailyProgressRecord } from "../models";

export class ProgressRepository extends BaseRepository<DailyProgressRecord> {
  constructor() {
    super("progress");
  }
}

export const progressRepository = new ProgressRepository();
