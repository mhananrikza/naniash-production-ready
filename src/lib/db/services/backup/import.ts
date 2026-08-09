import { getDatabase } from "../../database";
import { promisifyTransaction } from "../../database/idb-utils";
import { InvalidBackupFileError } from "../../errors";
import { dbEvents } from "../../events";
import { nowIso } from "../../utils/id";
import { backupFileSchema } from "./schema";
import { BACKUP_FORMAT_VERSION, BACKUPABLE_STORE_NAMES } from "./types";
import type { BackupFile, ImportMode, ImportSummary } from "./types";

const MAX_BACKUP_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25MB — jauh di atas ukuran wajar, cukup untuk cegah file "sampah" raksasa

/** Bentuk `readingHistory` di file backup format v1 (sebelum "Continue Reading" generik). */
interface LegacyReadingHistoryRecordV1 {
  id: string;
  progress: number;
  completed: boolean;
  lastReadAt: string;
}

/**
 * Migrasi backup format v1 -> v2: `readingHistory` v1 cuma melacak artikel
 * Perpustakaan (id = slug polos, tanpa posisi baca) — dipetakan jadi
 * bentuk v2 dengan `type: "artikel"` (satu-satunya jenis konten yang
 * dilacak di v1) dan posisi default (v1 tidak pernah menyimpan posisi
 * scroll, jadi tidak ada yang bisa dipulihkan untuk field itu).
 *
 * Store lain (favorites, journal, dst.) tidak berubah bentuk antara v1
 * dan v2, jadi tidak perlu disentuh di sini.
 */
/**
 * Migrasi v1 -> v2: lihat komentar `LegacyReadingHistoryRecordV1` di atas.
 * Hanya berlaku bila `formatVersion` masih 1; v2 sudah berbentuk final
 * untuk `readingHistory`, jadi dilewati bila `data` tidak sesuai bentuk v1.
 */
function migrateReadingHistoryV1ToV2(data: Record<string, unknown>): Record<string, unknown> {
  if (!Array.isArray(data.readingHistory)) return data;

  const migratedReadingHistory = (data.readingHistory as LegacyReadingHistoryRecordV1[]).map((legacy) => ({
    id: `artikel:${legacy.id}`,
    type: "artikel" as const,
    slug: legacy.id,
    position: { scrollY: 0, anchorId: null },
    progress: legacy.progress,
    completed: legacy.completed,
    startedAt: legacy.lastReadAt,
    lastReadAt: legacy.lastReadAt,
  }));

  return { ...data, readingHistory: migratedReadingHistory };
}

/**
 * Migrasi v1/v2 -> v3: store `dailyJourney` (Daily Journey Engine) belum
 * ada sama sekali di backup lama — bukan berubah bentuk, cuma belum
 * pernah ada. Isi array kosong supaya lolos validasi zod, bukan menolak
 * seluruh file backup lama hanya karena satu store baru.
 */
function migrateDailyJourneyMissingToV3(data: Record<string, unknown>): Record<string, unknown> {
  if (Array.isArray(data.dailyJourney)) return data;
  return { ...data, dailyJourney: [] };
}

function migrateBackupJson(json: unknown): unknown {
  if (typeof json !== "object" || json === null) return json;
  const root = json as Record<string, unknown>;

  const meta = root.meta as Record<string, unknown> | undefined;
  if (!meta || typeof meta.formatVersion !== "number" || meta.formatVersion >= BACKUP_FORMAT_VERSION) {
    return json; // sudah versi terbaru, atau bukan bentuk yang dikenal (biar zod yang menolak)
  }

  let data = root.data as Record<string, unknown> | undefined;
  if (!data) return json;

  if (meta.formatVersion === 1) data = migrateReadingHistoryV1ToV2(data);
  data = migrateDailyJourneyMissingToV3(data);

  return {
    ...root,
    meta: { ...meta, formatVersion: BACKUP_FORMAT_VERSION },
    data,
  };
}

/**
 * Parse & validasi string JSON menjadi `BackupFile`.
 *
 * Melempar `InvalidBackupFileError` (bukan error generik) bila:
 * - string bukan JSON yang valid,
 * - JSON valid tapi bukan file backup aplikasi ini (`meta.app`/`meta.kind` salah),
 * - struktur data tidak sesuai skema yang diharapkan (field hilang/tipe salah).
 *
 * Backup format lama (v1) otomatis dimigrasikan lebih dulu lewat
 * `migrateBackupJson` sebelum divalidasi terhadap skema v2 saat ini.
 */
export function parseBackupFile(raw: string): BackupFile {
  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(raw);
  } catch {
    throw new InvalidBackupFileError("File bukan JSON yang valid.");
  }

  parsedJson = migrateBackupJson(parsedJson);

  const result = backupFileSchema.safeParse(parsedJson);
  if (!result.success) {
    const firstIssue = result.error.issues[0];
    const location = firstIssue && firstIssue.path.length > 0 ? firstIssue.path.join(".") : "berkas";
    const detail = firstIssue ? `${location}: ${firstIssue.message}` : "Struktur data tidak sesuai.";
    throw new InvalidBackupFileError(
      `File backup tidak sesuai format "Hadiah dari Langit" (${detail}).`
    );
  }

  // `result.data` sudah lolos validasi runtime `backupFileSchema` di atas.
  // Cast eksplisit di sini murni untuk menjembatani ketidakcocokan tipe statis
  // Zod (field `value: z.unknown()` disimpulkan opsional) dengan `SettingsRecord`
  // (mewajibkan `value`) — tidak ada perubahan perilaku runtime.
  return result.data as BackupFile;
}

/**
 * Restore data dari `BackupFile` ke IndexedDB dalam SATU transaksi atomik
 * yang mencakup seluruh store yang di-backup (`BACKUPABLE_STORE_NAMES`) —
 * kalau ada satu masalah di tengah jalan, seluruh transaksi dibatalkan dan
 * data lama tidak berubah sama sekali (tidak ada kondisi "restore setengah
 * jalan").
 */
export async function importBackup(
  backup: BackupFile,
  mode: ImportMode = "replace"
): Promise<ImportSummary> {
  const db = await getDatabase();
  const transaction = db.transaction(BACKUPABLE_STORE_NAMES, "readwrite");

  for (const storeName of BACKUPABLE_STORE_NAMES) {
    const store = transaction.objectStore(storeName);
    if (mode === "replace") store.clear();
    for (const record of backup.data[storeName]) {
      store.put(record);
    }
  }

  await promisifyTransaction(transaction);

  for (const storeName of BACKUPABLE_STORE_NAMES) dbEvents.emit(storeName);

  const counts = Object.fromEntries(
    BACKUPABLE_STORE_NAMES.map((storeName) => [storeName, backup.data[storeName].length])
  ) as ImportSummary["counts"];

  return { mode, importedAt: nowIso(), counts };
}

/**
 * Baca file `.json` yang dipilih pengguna (mis. dari `<input type="file">`),
 * validasi, lalu restore ke IndexedDB. Ini fungsi utama yang dipakai UI
 * "Import Backup" nanti — sudah mencakup seluruh validasi yang diperlukan.
 */
export async function importBackupFromFile(
  file: File,
  mode: ImportMode = "replace"
): Promise<ImportSummary> {
  const looksLikeJson = file.type === "application/json" || file.name.toLowerCase().endsWith(".json");
  if (!looksLikeJson) {
    throw new InvalidBackupFileError("File harus berformat .json.");
  }

  if (file.size === 0) {
    throw new InvalidBackupFileError("File kosong.");
  }

  if (file.size > MAX_BACKUP_FILE_SIZE_BYTES) {
    throw new InvalidBackupFileError("Ukuran file terlalu besar untuk sebuah backup yang valid.");
  }

  const raw = await file.text();
  const backup = parseBackupFile(raw);
  return importBackup(backup, mode);
}
