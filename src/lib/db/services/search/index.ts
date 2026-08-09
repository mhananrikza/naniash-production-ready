/**
 * Search Engine lokal — titik impor tunggal. Import selalu dari sini
 * (`@/lib/db` re-export modul ini, lihat `../index.ts`), bukan dari file
 * individual di folder ini.
 *
 * Lihat `README.md` di folder ini untuk penjelasan lengkap strategi
 * indexing (inverted index, prefix range query, tf-idf-ish scoring,
 * version-gated rebuild).
 *
 * Pemakaian umum (di Client Component / hook, setelah mount):
 *
 * ```ts
 * import { searchService } from "@/lib/db";
 *
 * await searchService.ensureIndexReady(); // sekali saat app dibuka
 *
 * const hasil = await searchService.search("kesabaran");
 * const hasilJudulSaja = await searchService.searchByTitle("doa anak");
 * const recent = await searchService.getRecentSearches();
 * const popular = await searchService.getPopularSearches();
 * ```
 */

import { ensureIndexReady, getIndexStatus } from "./search-index.service";
import {
  findByExactTag,
  search,
  searchByCategory,
  searchByContent,
  searchByTag,
  searchByTitle,
} from "./search-query.service";
import { searchHistoryService } from "./search-history.service";

export const searchService = {
  // Index
  ensureIndexReady,
  getIndexStatus,

  // Query
  search,
  searchByTitle,
  searchByContent,
  searchByCategory,
  searchByTag,
  findByExactTag,

  // Recent Search / Search History / Popular Search
  getRecentSearches: searchHistoryService.getRecent,
  getPopularSearches: searchHistoryService.getPopular,
  removeSearchHistoryEntry: searchHistoryService.removeHistoryEntry,
  clearSearchHistory: searchHistoryService.clearHistory,
  clearPopularSearches: searchHistoryService.clearPopular,
};

export type {
  SearchField,
  SearchQueryOptions,
  SearchResultItem,
  SearchHistoryEntry,
  PopularSearchEntry,
  SearchIndexStatus,
  SearchDataDocument,
  SearchDataFile,
} from "@/types/search";
