import { getDatabase } from "../../database";
import { promisifyRequest, promisifyTransaction } from "../../database/idb-utils";
import { NotSupportedError } from "../../errors";
import { nowIso } from "../../utils/id";
import { BACKUP_APP_ID, BACKUP_FORMAT_VERSION, BACKUPABLE_STORE_NAMES } from "./types";
import type { BackupData, BackupFile } from "./types";

/**
 * Baca store yang di-backup (`BACKUPABLE_STORE_NAMES` — TIDAK termasuk
 * store Search Engine, lihat penjelasan di `types.ts`) dalam SATU transaksi
 * `readonly` supaya hasilnya jadi snapshot yang konsisten (tidak ada store
 * yang "lebih baru" dari store lain karena sempat ada tulisan di antara
 * pembacaan).
 */
async function readAllStores(): Promise<BackupData> {
  const db = await getDatabase();
  const transaction = db.transaction(BACKUPABLE_STORE_NAMES, "readonly");

  const entries = await Promise.all(
    BACKUPABLE_STORE_NAMES.map(async (storeName): Promise<[keyof BackupData, unknown[]]> => {
      const store = transaction.objectStore(storeName);
      const records = await promisifyRequest<unknown[]>(store.getAll());
      return [storeName, records];
    })
  );

  await promisifyTransaction(transaction);

  // Aman di-cast: entries dibangun langsung dari BACKUPABLE_STORE_NAMES,
  // jadi seluruh key BackupData pasti terisi — data di dalamnya sudah
  // tervalidasi saat ditulis lewat service/repository masing-masing.
  return Object.fromEntries(entries) as unknown as BackupData;
}

/** Ambil seluruh data lokal sebagai objek `BackupFile`, siap diserialisasi/diunduh. */
export async function exportBackup(): Promise<BackupFile> {
  const data = await readAllStores();
  return {
    meta: {
      app: BACKUP_APP_ID,
      kind: "backup",
      formatVersion: BACKUP_FORMAT_VERSION,
      exportedAt: nowIso(),
    },
    data,
  };
}

/** Nama file sesuai konvensi: `hadiah-dari-langit-backup-YYYY-MM-DD.json` (tanggal lokal perangkat). */
export function buildBackupFilename(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `hadiah-dari-langit-backup-${year}-${month}-${day}.json`;
}

/** Serialisasi `BackupFile` ke string JSON yang rapi (mudah dibaca bila dibuka manual). */
export function serializeBackup(backup: BackupFile): string {
  return JSON.stringify(backup, null, 2);
}

/**
 * Trigger unduhan file backup di browser lewat elemen `<a>` sementara.
 * Hanya bisa dipanggil dari Client Component setelah mount (butuh `document`).
 */
export function downloadBackupFile(backup: BackupFile, filename: string = buildBackupFilename()): void {
  if (typeof document === "undefined") {
    throw new NotSupportedError("Unduh file backup hanya bisa dilakukan di browser.");
  }

  const blob = new Blob([serializeBackup(backup)], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  try {
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Gabungan export + unduh — dipanggil langsung dari tombol "Export Backup" nanti. */
export async function exportAndDownloadBackup(): Promise<BackupFile> {
  const backup = await exportBackup();
  downloadBackupFile(backup);
  return backup;
}
