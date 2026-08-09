/**
 * Tipe untuk Search Engine lokal (`src/lib/db/services/search/`). Terpisah
 * dari `@/types/content` karena search-data.json adalah bentuk "rata"
 * (flattened) lintas jenis konten — bukan union diskriminatif seperti
 * `ContentItem`, karena tujuannya beda: bukan untuk merender halaman
 * detail, tapi untuk ditokenize & dicari.
 */

import type { SearchField } from "@/lib/db/models";

export type { SearchField };

/** Satu dokumen di `public/search-data.json`, dihasilkan `scripts/generate-search-data.mjs`. */
export interface SearchDataDocument {
  id: string;
  slug: string;
  type: "doa" | "dzikir" | "afirmasi" | "artikel";
  title: string;
  category: string;
  tags: string[];
  excerpt: string;
  /** Body Markdown (sudah di-strip jadi plain text) + field teks khas per jenis konten. */
  contentText: string;
}

/** Bentuk lengkap file `public/search-data.json`. */
export interface SearchDataFile {
  /** Hash isi seluruh konten — dipakai `search-index.service.ts` untuk tahu kapan index perlu dibangun ulang. */
  version: string;
  generatedAt: string;
  count: number;
  documents: SearchDataDocument[];
}

export interface SearchQueryOptions {
  /** Batasi pencarian ke field tertentu — inilah yang membedakan "Search Judul" / "Search Isi" / "Search Kategori" / "Search Tag". Default: semua field. */
  fields?: SearchField[];
  /** Batasi ke satu/beberapa jenis konten. */
  type?: SearchDataDocument["type"] | SearchDataDocument["type"][];
  /** Batasi jumlah hasil. Default 20. */
  limit?: number;
  /**
   * Catat pencarian ini ke Search History (& ikut menambah Popular Search).
   * Default `true`. Set `false` untuk pencarian "diam-diam" (mis. saat
   * mem-validasi sesuatu di background, bukan pencarian sungguhan dari
   * pengguna).
   */
  recordHistory?: boolean;
}

export interface SearchResultItem {
  id: string;
  slug: string;
  type: SearchDataDocument["type"];
  title: string;
  category: string;
  tags: string[];
  excerpt: string;
  /** Skor relevansi gabungan — semakin besar semakin cocok, bukan persentase. */
  score: number;
  /** Field yang menyumbang kecocokan, mis. `["title", "tags"]` — untuk highlight di UI nantinya. */
  matchedFields: SearchField[];
}

export interface SearchHistoryEntry {
  id: string;
  query: string;
  resultCount: number;
  createdAt: string;
}

export interface PopularSearchEntry {
  query: string;
  count: number;
  lastUsedAt: string;
}

export type SearchIndexStatus =
  | { state: "empty" }
  | { state: "ready"; version: string; documentCount: number }
  | { state: "building" }
  | { state: "error"; message: string };
