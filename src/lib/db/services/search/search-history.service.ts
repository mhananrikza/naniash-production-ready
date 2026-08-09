import { searchHistoryRepository } from "../../repository/search-history.repository";
import { searchStatsRepository } from "../../repository/search-stats.repository";
import { createId, nowIso } from "../../utils/id";
import { normalizeText } from "@/utils/search";
import type { SearchHistoryRecord, SearchStatRecord } from "../../models";
import type { PopularSearchEntry, SearchHistoryEntry } from "@/types/search";

/**
 * ---------------------------------------------------------------------------
 * RECENT SEARCH vs POPULAR SEARCH — dua store, dua akses pattern berbeda
 * ---------------------------------------------------------------------------
 * - `searchHistory`: log mentah, satu record PER PENCARIAN (append-only).
 *   Sumber "Recent Search" — dibaca terurut mundur berdasarkan `createdAt`
 *   lewat cursor (`findRecent`, lihat repository), lalu dideduplikasi di
 *   sini supaya "kesabaran" yang dicari 5x berturut-turut tidak memenuhi
 *   seluruh daftar recent dengan entri yang sama.
 * - `searchStats`: SATU record per query unik (ternormalisasi) dengan
 *   counter `count` yang di-increment tiap kali query itu dicari lagi.
 *   Sumber "Popular Search" — supaya menghitung "query mana yang paling
 *   sering dicari" tidak perlu scan+reduce seluruh `searchHistory` (yang
 *   terus bertambah seiring pemakaian), cukup baca `searchStats` yang
 *   ukurannya sebanding dengan jumlah query UNIK (jauh lebih kecil &
 *   stabil dibanding jumlah total pencarian).
 *
 * Kedua store ditulis bersamaan di `record()` di bawah, dalam operasi yang
 * sama — "menyimpan riwayat" dan "meng-update statistik popularitas"
 * selalu terjadi berbarengan setiap ada pencarian baru.
 */

const DEFAULT_RECENT_LIMIT = 10;
const DEFAULT_POPULAR_LIMIT = 10;
/** Overfetch riwayat mentah sebelum dedupe, supaya `getRecent(10)` tetap dapat 10 query BERBEDA walau ada banyak pencarian berulang di antaranya. */
const RECENT_OVERFETCH_MULTIPLIER = 5;

export const searchHistoryService = {
  /** Catat satu pencarian: tambah ke riwayat + update counter popularitas. Dipanggil otomatis oleh `search()` (lihat `search-query.service.ts`), kecuali `recordHistory: false`. */
  async record(query: string, resultCount: number): Promise<void> {
    const trimmed = query.trim();
    if (!trimmed) return;

    const normalizedQuery = normalizeText(trimmed);

    const historyRecord: SearchHistoryRecord = {
      id: createId(),
      query: trimmed,
      normalizedQuery,
      resultCount,
      createdAt: nowIso(),
    };

    const existingStat = await searchStatsRepository.findByQuery(normalizedQuery);
    const statRecord: SearchStatRecord = {
      query: normalizedQuery,
      displayQuery: trimmed,
      count: (existingStat?.count ?? 0) + 1,
      lastUsedAt: nowIso(),
    };

    await Promise.all([searchHistoryRepository.put(historyRecord), searchStatsRepository.put(statRecord)]);
  },

  /** "Recent Search" — `limit` query TERBARU & BERBEDA (dideduplikasi), terbaru dulu. */
  async getRecent(limit: number = DEFAULT_RECENT_LIMIT): Promise<SearchHistoryEntry[]> {
    const rawRecords = await searchHistoryRepository.findRecent(limit * RECENT_OVERFETCH_MULTIPLIER);

    const seen = new Set<string>();
    const result: SearchHistoryEntry[] = [];

    for (const record of rawRecords) {
      if (seen.has(record.normalizedQuery)) continue;
      seen.add(record.normalizedQuery);
      result.push({
        id: record.id,
        query: record.query,
        resultCount: record.resultCount,
        createdAt: record.createdAt,
      });
      if (result.length >= limit) break;
    }

    return result;
  },

  /** "Popular Search" — `limit` query dengan jumlah pencarian (`count`) terbanyak, berdasarkan penggunaan lokal (bukan data global/server). */
  async getPopular(limit: number = DEFAULT_POPULAR_LIMIT): Promise<PopularSearchEntry[]> {
    const records = await searchStatsRepository.findTopByCount(limit);
    return records.map((record) => ({
      query: record.displayQuery,
      count: record.count,
      lastUsedAt: record.lastUsedAt,
    }));
  },

  /** Hapus satu entri riwayat (mis. tombol "hapus" di satu baris Recent Search UI nantinya). Tidak memengaruhi counter Popular Search. */
  async removeHistoryEntry(id: string): Promise<void> {
    await searchHistoryRepository.delete(id);
  },

  /** Bersihkan seluruh Recent Search. Popular Search TIDAK ikut terhapus (keduanya independen secara sengaja). */
  async clearHistory(): Promise<void> {
    await searchHistoryRepository.clear();
  },

  /** Bersihkan seluruh statistik Popular Search. Recent Search TIDAK ikut terhapus. */
  async clearPopular(): Promise<void> {
    await searchStatsRepository.clear();
  },
};
