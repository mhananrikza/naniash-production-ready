import { BaseRepository } from "./base.repository";
import type { SearchStatRecord } from "../models";

export class SearchStatsRepository extends BaseRepository<SearchStatRecord> {
  constructor() {
    super("searchStats");
  }

  /**
   * `limit` query paling sering dicari, terurut dari yang paling banyak.
   * Sama seperti `SearchHistoryRepository.findRecent`, pakai cursor mundur
   * di index `count` supaya biaya query sebanding dengan `limit`, bukan
   * dengan jumlah query unik yang pernah dicari (yang terus bertambah).
   */
  async findTopByCount(limit: number): Promise<SearchStatRecord[]> {
    const { store } = await this.openStore("readonly");
    const index = store.index("count");

    return new Promise((resolve, reject) => {
      const results: SearchStatRecord[] = [];
      const request = index.openCursor(null, "prev");

      request.onsuccess = () => {
        const cursor = request.result;
        if (!cursor || results.length >= limit) {
          resolve(results);
          return;
        }
        results.push(cursor.value as SearchStatRecord);
        cursor.continue();
      };
      request.onerror = () => reject(request.error ?? new Error("Gagal membaca statistik pencarian."));
    });
  }

  findByQuery(normalizedQuery: string): Promise<SearchStatRecord | undefined> {
    return this.getById(normalizedQuery);
  }
}

export const searchStatsRepository = new SearchStatsRepository();
