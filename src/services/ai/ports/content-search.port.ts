import type { ContentType } from "@/types/content";

/** Satu hasil pencarian materi — bentuk minimal yang dibutuhkan AI Engine, terlepas dari mesin pencari apa pun yang sebenarnya menghasilkannya. */
export interface ContentSearchHit {
  type: ContentType;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  score: number;
}

/**
 * Abstraksi pencarian materi Markdown (doa, dzikir, afirmasi, artikel)
 * yang dibutuhkan Mode Offline (`offline/offline-ai-provider.ts`).
 *
 * INI kunci pola Dependency Injection di modul ini pada lapis kedua:
 * `OfflineAiProvider` bergantung pada interface ini, BUKAN pada
 * `searchService` dari `@/lib/db` secara langsung. Implementasi
 * sungguhan (`adapters/local-search.adapter.ts`, yang membungkus Search
 * Engine lokal berbasis IndexedDB) di-inject lewat constructor —
 * `OfflineAiProvider` sendiri tidak pernah tahu (dan tidak perlu tahu)
 * bahwa di baliknya ada IndexedDB, inverted index, atau
 * `public/search-data.json` sama sekali.
 *
 * Manfaatnya: sumber pencarian offline bisa diganti kapan pun (mis.
 * suatu hari pindah ke SQLite WASM, atau ke pencarian sisi server saat
 * online) hanya dengan menulis adapter baru yang mengimplementasikan
 * port ini — `OfflineAiProvider` tidak perlu disentuh sama sekali.
 */
export interface ContentSearchPort {
  /** Cari lintas jenis konten — dipakai sebagai pencarian umum/fallback. */
  search(
    query: string,
    options?: { type?: ContentType | ContentType[]; limit?: number }
  ): Promise<ContentSearchHit[]>;

  /** Cari doa yang relevan dengan `query`. */
  searchDoa(query: string, limit?: number): Promise<ContentSearchHit[]>;

  /** Cari artikel yang relevan dengan `query`. */
  searchArtikel(query: string, limit?: number): Promise<ContentSearchHit[]>;

  /** Cari afirmasi yang relevan dengan `query`. */
  searchAfirmasi(query: string, limit?: number): Promise<ContentSearchHit[]>;

  /** `true` bila sumber pencarian ini siap dipakai saat ini (mis. index Search Engine sudah terbangun). */
  isReady(): Promise<boolean>;
}
