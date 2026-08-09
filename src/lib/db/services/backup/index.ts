export {
  BACKUP_APP_ID,
  BACKUP_FORMAT_VERSION,
  type BackupData,
  type BackupFile,
  type BackupMeta,
  type ImportMode,
  type ImportSummary,
} from "./types";

import {
  buildBackupFilename,
  downloadBackupFile,
  exportAndDownloadBackup,
  exportBackup,
  serializeBackup,
} from "./export";
import { importBackup, importBackupFromFile, parseBackupFile } from "./import";

/**
 * API publik fitur Backup & Restore, dipakai halaman/komponen pengaturan
 * nanti. Contoh:
 *
 * ```ts
 * import { backupService } from "@/lib/db";
 *
 * // Export
 * await backupService.exportAndDownload();
 *
 * // Import dari <input type="file">
 * const file = event.target.files?.[0];
 * if (file) {
 *   try {
 *     const summary = await backupService.restoreFromFile(file);
 *     console.log(`Berhasil restore ${summary.counts.journal} entri jurnal, dst.`);
 *   } catch (error) {
 *     if (error instanceof InvalidBackupFileError) {
 *       // tampilkan pesan "file tidak valid" ke pengguna
 *     }
 *   }
 * }
 * ```
 */
export const backupService = {
  /** Ambil seluruh data lokal sebagai objek `BackupFile` (tanpa mengunduh). */
  export: exportBackup,
  /** Export lalu langsung trigger unduhan `hadiah-dari-langit-backup-YYYY-MM-DD.json`. */
  exportAndDownload: exportAndDownloadBackup,
  /** Trigger unduhan untuk `BackupFile` yang sudah ada (mis. hasil `export()`). */
  download: downloadBackupFile,
  /** Serialisasi `BackupFile` ke string JSON — berguna untuk pratinjau/testing. */
  serialize: serializeBackup,
  /** Nama file default sesuai konvensi penamaan. */
  buildFilename: buildBackupFilename,
  /** Validasi & parse string JSON menjadi `BackupFile`. Melempar `InvalidBackupFileError` bila tidak valid. */
  parse: parseBackupFile,
  /** Restore `BackupFile` yang sudah divalidasi ke IndexedDB. */
  restore: importBackup,
  /** Baca, validasi, lalu restore langsung dari `File` (mis. dari `<input type="file">`). */
  restoreFromFile: importBackupFromFile,
};
