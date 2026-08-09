import { z } from "zod";

import { BACKUP_APP_ID } from "./types";

/**
 * Skema validasi runtime untuk file backup, satu-satunya sumber kebenaran
 * "apakah file ini valid?". Field & tipe di sini harus selalu sinkron
 * dengan model di `../../models.ts` — kalau model berubah, sesuaikan juga
 * skema ini (dan pertimbangkan menaikkan `BACKUP_FORMAT_VERSION`).
 */

const favoriteTypeSchema = z.enum(["article", "doa", "dzikir", "afirmasi", "tirakat"]);
const reminderTypeSchema = z.enum(["doa", "tirakat", "jurnal", "custom"]);
const readableContentTypeSchema = z.enum(["doa", "dzikir", "afirmasi", "artikel"]);

const favoriteRecordSchema = z.object({
  id: z.string().min(1),
  type: favoriteTypeSchema,
  refId: z.string().min(1),
  createdAt: z.string().min(1),
});

const journalRecordSchema = z.object({
  id: z.string().min(1),
  date: z.string().min(1),
  mood: z.string().nullable(),
  moodEmoji: z.string().nullable(),
  content: z.string(),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
});

const dailyProgressItemStateSchema = z.object({
  done: z.boolean(),
  updatedAt: z.string().min(1),
});

const dailyProgressRecordSchema = z.object({
  id: z.string().min(1),
  items: z.record(dailyProgressItemStateSchema),
  updatedAt: z.string().min(1),
});

const challengeRecordSchema = z.object({
  id: z.string().min(1),
  title: z.string(),
  totalDays: z.number().int().nonnegative(),
  startedAt: z.string().min(1),
  checkIns: z.record(z.boolean()),
  updatedAt: z.string().min(1),
});

const settingsRecordSchema = z.object({
  key: z.string().min(1),
  value: z.unknown(),
  updatedAt: z.string().min(1),
});

const reminderRecordSchema = z.object({
  id: z.string().min(1),
  type: reminderTypeSchema,
  title: z.string(),
  time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Format jam harus HH:mm"),
  days: z.array(z.number().int().min(0).max(6)),
  enabled: z.boolean(),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
});

const readingPositionSchema = z.object({
  scrollY: z.number().min(0),
  anchorId: z.string().nullable(),
});

const readingHistoryRecordSchema = z.object({
  id: z.string().min(1),
  type: readableContentTypeSchema,
  slug: z.string().min(1),
  position: readingPositionSchema,
  progress: z.number().min(0).max(100),
  completed: z.boolean(),
  startedAt: z.string().min(1),
  lastReadAt: z.string().min(1),
});

const dailyJourneySlotNameSchema = z.enum(["doa", "dzikir", "afirmasi", "artikel"]);

const dailyJourneyRecordSchema = z.object({
  id: z.string().min(1),
  itemIds: z.record(dailyJourneySlotNameSchema, z.string().min(1)),
  completion: z.record(dailyJourneySlotNameSchema, z.boolean()),
  generatedAt: z.string().min(1),
  completedAt: z.string().nullable(),
});

const backupDataSchema = z.object({
  favorites: z.array(favoriteRecordSchema),
  journal: z.array(journalRecordSchema),
  progress: z.array(dailyProgressRecordSchema),
  challenge: z.array(challengeRecordSchema),
  settings: z.array(settingsRecordSchema),
  reminder: z.array(reminderRecordSchema),
  readingHistory: z.array(readingHistoryRecordSchema),
  dailyJourney: z.array(dailyJourneyRecordSchema),
});

const backupMetaSchema = z.object({
  app: z.literal(BACKUP_APP_ID),
  kind: z.literal("backup"),
  formatVersion: z.number().int().positive(),
  exportedAt: z.string().min(1),
});

/** Skema utuh file backup — dipakai `import.ts` untuk memvalidasi file yang diunggah pengguna. */
export const backupFileSchema = z.object({
  meta: backupMetaSchema,
  data: backupDataSchema,
});
