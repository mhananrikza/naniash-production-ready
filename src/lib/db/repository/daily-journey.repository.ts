import { BaseRepository } from "./base.repository";
import type { DailyJourneyRecord } from "../models";

export class DailyJourneyRepository extends BaseRepository<DailyJourneyRecord> {
  constructor() {
    super("dailyJourney");
  }
}

export const dailyJourneyRepository = new DailyJourneyRepository();
