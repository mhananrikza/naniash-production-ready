import { searchService } from "@/lib/db";
import type { ContentType } from "@/types/content";
import type { SearchResultItem } from "@/types/search";
import type { ContentSearchHit, ContentSearchPort } from "../ports/content-search.port";

/**
 * Implementasi `ContentSearchPort` yang sesungguhnya dipakai aplikasi:
 * membungkus Search Engine lokal (`@/lib/db` — `searchService`), yang
 * index-nya dibangun dari file Markdown di `/content` lewat
 * `public/search-data.json` (lihat `scripts/generate-search-data.mjs`)
 * dan disimpan di IndexedDB. 100% berjalan di browser, TANPA sekali pun
 * menyentuh network setelah `search-data.json` ter-cache — cocok untuk
 * Mode Offline AI Engine.
 *
 * Ini SATU-SATUNYA file di `@/services/ai` yang mengimpor `@/lib/db` —
 * seluruh sisa AI Engine (termasuk `OfflineAiProvider`) hanya kenal
 * `ContentSearchPort`, sesuai pola Dependency Injection yang dipakai di
 * modul ini (lihat penjelasan di `ports/content-search.port.ts`).
 */
export function createLocalSearchAdapter(): ContentSearchPort {
  function toHit(item: SearchResultItem): ContentSearchHit {
    return {
      type: item.type,
      slug: item.slug,
      title: item.title,
      excerpt: item.excerpt,
      category: item.category,
      score: item.score,
    };
  }

  async function searchByType(query: string, type: ContentType, limit: number): Promise<ContentSearchHit[]> {
    // `recordHistory: false` — pencarian ini dipicu AI Engine, bukan pengguna
    // mengetik langsung di kolom Search, jadi tidak seharusnya ikut muncul
    // di "Recent Search"/"Popular Search".
    const results = await searchService.search(query, { type, limit, recordHistory: false });
    return results.map(toHit);
  }

  return {
    async search(query, options) {
      const results = await searchService.search(query, {
        type: options?.type,
        limit: options?.limit,
        recordHistory: false,
      });
      return results.map(toHit);
    },

    searchDoa(query, limit = 3) {
      return searchByType(query, "doa", limit);
    },

    searchArtikel(query, limit = 3) {
      return searchByType(query, "artikel", limit);
    },

    searchAfirmasi(query, limit = 3) {
      return searchByType(query, "afirmasi", limit);
    },

    async isReady() {
      // `ensureIndexReady()` aman dipanggil berulang — no-op cepat bila
      // index sudah sesuai versi konten terkini (lihat
      // `search-index.service.ts`), jadi bisa dipanggil sebagai bagian
      // dari "apakah siap" tanpa biaya berarti setelah kunjungan pertama.
      const status = await searchService.ensureIndexReady();
      return status.state === "ready";
    },
  };
}
