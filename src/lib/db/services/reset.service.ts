import { getDatabase } from "../database";
import { promisifyTransaction } from "../database/idb-utils";
import { dbEvents } from "../events";
import { BACKUPABLE_STORE_NAMES } from "./backup/types";
import type { StoreName } from "../database";

/**
 * Store yang DIHAPUS oleh "Hapus Semua Data" (Zona Berbahaya) — persis
 * store yang sama dengan `BACKUPABLE_STORE_NAMES` (favorit, journal,
 * progress, challenge, settings, reminder, readingHistory, dailyJourney)
 * DITAMBAH `reminderSchedule` (jadwal in-memory Reminder Engine yang
 * diturunkan dari `settings`, ikut direset supaya tidak menyisakan jadwal
 * "yatim" dari pengaturan reminder yang baru saja dihapus).
 *
 * SENGAJA TIDAK termasuk store Search Engine (`searchDocuments`,
 * `searchTerms`, `searchHistory`, `searchStats`) maupun konten Markdown
 * materi (yang bahkan tidak pernah disimpan di IndexedDB, langsung dibaca
 * dari `content/` saat build) — sesuai instruksi "materi aplikasi TIDAK
 * boleh ikut terhapus". Index pencarian murni turunan materi dan otomatis
 * dibangun ulang oleh `ensureIndexReady()` bila kosong, jadi aman
 * diabaikan di sini.
 */
const RESETTABLE_STORE_NAMES: readonly StoreName[] = [...BACKUPABLE_STORE_NAMES, "reminderSchedule"];

/**
 * Reset Service — dipakai satu-satunya oleh bagian "Zona Berbahaya" di
 * halaman Settings. Mengosongkan seluruh store data pribadi dalam SATU
 * transaksi atomik (pola sama seperti `importBackup` di
 * `services/backup/import.ts`) supaya tidak ada kondisi "terhapus
 * sebagian". UI wajib menampilkan konfirmasi dua tahap SEBELUM memanggil
 * ini — service ini sendiri tidak menahan/mengonfirmasi apa pun.
 */
export const resetService = {
  async resetAllUserData(): Promise<void> {
    const db = await getDatabase();
    const transaction = db.transaction(RESETTABLE_STORE_NAMES, "readwrite");

    for (const storeName of RESETTABLE_STORE_NAMES) {
      transaction.objectStore(storeName).clear();
    }

    await promisifyTransaction(transaction);

    for (const storeName of RESETTABLE_STORE_NAMES) dbEvents.emit(storeName);
  },
};
