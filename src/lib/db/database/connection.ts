/**
 * Pengelola koneksi IndexedDB. Ini satu-satunya modul yang boleh memanggil
 * `indexedDB.open` secara langsung — repository selalu lewat `getDatabase()`
 * di sini supaya hanya ada satu koneksi aktif per sesi browser.
 */

import { NotSupportedError } from "../errors";
import { DB_NAME, DB_VERSION, runMigrations } from "./schema";

export function isIndexedDbSupported(): boolean {
  return typeof window !== "undefined" && typeof window.indexedDB !== "undefined";
}

let dbPromise: Promise<IDBDatabase> | null = null;

/**
 * Membuka (atau mengambil dari cache) koneksi database. Aman dipanggil
 * berkali-kali dari mana saja — hanya benar-benar membuka koneksi sekali.
 *
 * Melempar `NotSupportedError` bila dipanggil di lingkungan tanpa
 * IndexedDB, misalnya saat Server Component/SSR mengimpor modul ini
 * secara tidak sengaja.
 */
export function getDatabase(): Promise<IDBDatabase> {
  if (!isIndexedDbSupported()) {
    return Promise.reject(new NotSupportedError());
  }

  if (dbPromise) return dbPromise;

  dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = request.result;
      const transaction = request.transaction;
      if (!transaction) return;
      runMigrations(db, transaction, event.oldVersion);
    };

    request.onsuccess = () => {
      const db = request.result;
      // Bila tab lain minta buka versi baru, lepas koneksi ini supaya tidak memblokirnya.
      db.onversionchange = () => {
        db.close();
        dbPromise = null;
      };
      resolve(db);
    };

    request.onerror = () => {
      dbPromise = null;
      reject(request.error ?? new Error("Gagal membuka database lokal."));
    };

    request.onblocked = () => {
      dbPromise = null;
      reject(
        new NotSupportedError(
          "Pembukaan database diblokir oleh koneksi di tab lain. Tutup tab lain yang membuka aplikasi ini lalu coba lagi."
        )
      );
    };
  });

  return dbPromise;
}

/**
 * Menutup & melupakan koneksi cache. Berguna untuk pengujian atau saat
 * pengguna memilih "hapus semua data lokal" dan butuh koneksi bersih.
 */
export function resetDatabaseConnection(): void {
  if (dbPromise) {
    dbPromise.then((db) => db.close()).catch(() => {});
  }
  dbPromise = null;
}
