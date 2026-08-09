import type {
  ChallengeRecord,
  FavoriteRecord,
  JournalRecord,
  DailyProgressRecord,
  DailyJourneyRecord,
  ReadingHistoryRecord,
  ReminderRecord,
  SettingsRecord,
} from "../../models";
import { type StoreName } from "../../database";

/** Identitas aplikasi, dipakai untuk menolak file backup dari aplikasi lain. */
export const BACKUP_APP_ID = "hadiah-dari-langit";

/**
 * Versi FORMAT file backup — independen dari `DB_VERSION` skema IndexedDB.
 * Naikkan bila struktur `BackupData` berubah dengan cara yang tidak
 * kompatibel mundur, lalu tambahkan langkah migrasi di `import.ts`.
 *
 * v2: `readingHistory` dirombak jadi "Continue Reading" generik lintas
 * jenis konten (`type` + `slug` + `position`, bukan cuma slug artikel +
 * `progress`) — lihat migrasi `migrateReadingHistoryV1ToV2` di `import.ts`.
 * v3: tambah `dailyJourney` (Daily Journey Engine). Backup lama (v1/v2)
 * tidak punya field ini sama sekali — `migrateBackupJson` mengisi array
 * kosong untuknya, bukan menolak file lama begitu saja.
 */
export const BACKUP_FORMAT_VERSION = 3;

/**
 * Isi data backup — satu array per object store. Kunci di sini harus
 * selalu sinkron dengan `BACKUPABLE_STORE_NAMES` di bawah (BUKAN seluruh
 * `StoreName` — lihat penjelasannya).
 */
export interface BackupData {
  favorites: FavoriteRecord[];
  journal: JournalRecord[];
  progress: DailyProgressRecord[];
  challenge: ChallengeRecord[];
  settings: SettingsRecord[];
  reminder: ReminderRecord[];
  readingHistory: ReadingHistoryRecord[];
  dailyJourney: DailyJourneyRecord[];
}

/**
 * Store yang DIIKUTKAN ke dalam backup — sengaja BUKAN seluruh
 * `STORE_NAMES`. Store Search Engine (`searchDocuments`, `searchTerms`,
 * `searchHistory`, `searchStats`, lihat `../search/`) sengaja DIKECUALIKAN:
 * `searchDocuments`/`searchTerms` murni index turunan dari konten Markdown
 * (`ensureIndexReady()` membangunnya ulang otomatis, tidak pernah ditulis
 * pengguna), sedangkan `searchHistory`/`searchStats` adalah data
 * penggunaan berisiko-rendah (mirip "baru dicari") yang wajar hilang saat
 * pindah perangkat — membawanya ke backup hanya menambah ukuran file
 * tanpa manfaat berarti bagi pengguna.
 */
export const BACKUPABLE_STORE_NAMES: readonly (keyof BackupData)[] = [
  "favorites",
  "journal",
  "progress",
  "challenge",
  "settings",
  "reminder",
  "readingHistory",
  "dailyJourney",
];

// Jaring pengaman waktu-kompilasi: kalau ada nama di atas yang bukan
// `StoreName` valid (mis. typo), baris ini akan gagal type-check.
const _typeCheckOnly: readonly StoreName[] = BACKUPABLE_STORE_NAMES;
void _typeCheckOnly;

export interface BackupMeta {
  app: typeof BACKUP_APP_ID;
  kind: "backup";
  formatVersion: number;
  /** Waktu file dibuat, ISO datetime. */
  exportedAt: string;
}

/** Struktur lengkap file `.json` backup. */
export interface BackupFile {
  meta: BackupMeta;
  data: BackupData;
}

/**
 * - `replace` (default): kosongkan tiap store lalu isi ulang dari backup —
 *   hasil akhir persis sama dengan isi file backup.
 * - `merge`: upsert saja — record dengan id sama tertimpa isi backup,
 *   record lain yang sudah ada di perangkat tetap dipertahankan.
 */
export type ImportMode = "replace" | "merge";

export interface ImportSummary {
  mode: ImportMode;
  importedAt: string;
  /** Jumlah record yang di-restore per store. */
  counts: Record<keyof BackupData, number>;
}
