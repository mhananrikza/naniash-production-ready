/**
 * Error kustom untuk layer database lokal, supaya pemanggil (service, dan
 * nantinya hook UI) bisa membedakan jenis kegagalan lewat `instanceof`
 * alih-alih mem-parsing pesan string.
 */

/** Error dasar — seluruh error di layer db/repository/service turunan dari ini. */
export class DatabaseError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "DatabaseError";
  }
}

/** IndexedDB tidak tersedia di lingkungan saat ini (SSR, browser lama, dsb). */
export class NotSupportedError extends DatabaseError {
  constructor(
    message = "IndexedDB tidak tersedia di lingkungan ini. Pastikan kode ini hanya dijalankan di Client Component setelah mount di browser."
  ) {
    super(message);
    this.name = "NotSupportedError";
  }
}

/** Record dengan id/key tertentu tidak ditemukan di object store. */
export class RecordNotFoundError extends DatabaseError {
  constructor(storeName: string, id: IDBValidKey) {
    super(`Record dengan id "${String(id)}" tidak ditemukan di store "${storeName}".`);
    this.name = "RecordNotFoundError";
  }
}

/**
 * File backup yang diimpor tidak valid — bukan JSON, bukan file backup
 * aplikasi ini, atau strukturnya tidak sesuai skema yang diharapkan.
 */
export class InvalidBackupFileError extends DatabaseError {
  constructor(message = "File backup tidak valid atau rusak.", options?: ErrorOptions) {
    super(message, options);
    this.name = "InvalidBackupFileError";
  }
}
