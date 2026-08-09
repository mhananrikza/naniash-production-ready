import { BaseRepository } from "./base.repository";
import type { ReadingHistoryRecord, ReadableContentType } from "../models";

/**
 * Repository "Continue Reading" — generik lintas jenis konten (doa, dzikir,
 * afirmasi, artikel), bukan cuma artikel Perpustakaan. Lihat
 * `reading-history.service.ts` untuk logika bisnis (kunci komposit,
 * ambang "selesai", dst.) — repository ini sengaja tipis, hanya CRUD +
 * satu query index tambahan.
 */
export class ReadingHistoryRepository extends BaseRepository<ReadingHistoryRecord> {
  constructor() {
    super("readingHistory");
  }

  /** Seluruh entri untuk satu jenis konten, mis. semua progres baca "artikel" saja. */
  findByType(type: ReadableContentType): Promise<ReadingHistoryRecord[]> {
    return this.getByIndex("type", type);
  }
}

export const readingHistoryRepository = new ReadingHistoryRepository();
