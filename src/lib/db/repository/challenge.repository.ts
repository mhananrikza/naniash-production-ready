import { BaseRepository } from "./base.repository";
import type { ChallengeRecord } from "../models";

export class ChallengeRepository extends BaseRepository<ChallengeRecord> {
  constructor() {
    super("challenge");
  }
}

export const challengeRepository = new ChallengeRepository();
