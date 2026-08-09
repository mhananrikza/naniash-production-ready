import { BaseRepository } from "./base.repository";
import type { SearchHistoryRecord } from "../models";

export class SearchHistoryRepository extends BaseRepository<SearchHistoryRecord> {
  constructor() {
    super("searchHistory");
  }

  /**
   * `limit` entri terbaru, terurut dari yang paling baru. Pakai cursor
   * mundur di index `createdAt` alih-alih `getAll()` lalu `sort()` di JS —
   * begitu `limit` kursor terpenuhi, iterasi langsung berhenti, jadi biaya
   * query sebanding dengan `limit` (biasanya 10–20), bukan dengan total
   * riwayat yang tersimpan (yang terus bertambah seiring pemakaian app).
   */
  async findRecent(limit: number): Promise<SearchHistoryRecord[]> {
    const { store } = await this.openStore("readonly");
    const index = store.index("createdAt");

    return new Promise((resolve, reject) => {
      const results: SearchHistoryRecord[] = [];
      const request = index.openCursor(null, "prev");

      request.onsuccess = () => {
        const cursor = request.result;
        if (!cursor || results.length >= limit) {
          resolve(results);
          return;
        }
        results.push(cursor.value as SearchHistoryRecord);
        cursor.continue();
      };
      request.onerror = () => reject(request.error ?? new Error("Gagal membaca riwayat pencarian."));
    });
  }

  findByNormalizedQuery(normalizedQuery: string): Promise<SearchHistoryRecord[]> {
    return this.getByIndex("normalizedQuery", normalizedQuery);
  }
}

export const searchHistoryRepository = new SearchHistoryRepository();
