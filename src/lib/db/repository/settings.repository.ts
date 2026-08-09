import { BaseRepository } from "./base.repository";
import type { SettingsRecord } from "../models";

export class SettingsRepository extends BaseRepository<SettingsRecord> {
  constructor() {
    super("settings");
  }
}

export const settingsRepository = new SettingsRepository();
