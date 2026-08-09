/**
 * Helper kecil untuk mengubah `IDBRequest`/`IDBTransaction` (berbasis event)
 * menjadi Promise. Dipakai `BaseRepository` untuk operasi satu store, dan
 * dipakai langsung oleh modul backup untuk transaksi lintas-store yang
 * butuh atomicity (lihat `services/backup/`).
 */

export function promisifyRequest<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Operasi IndexedDB gagal."));
  });
}

export function promisifyTransaction(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error("Transaksi IndexedDB gagal."));
    transaction.onabort = () => reject(transaction.error ?? new Error("Transaksi IndexedDB dibatalkan."));
  });
}
