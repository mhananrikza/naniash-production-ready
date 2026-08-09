import type { AiProvider } from "../provider";
import type { AiAskInput, AiProviderInfo, AiReply, AiSource } from "../types";
import type { ContentSearchHit, ContentSearchPort } from "../ports/content-search.port";
import { buildOfflineReplyText } from "./reply-templates";

/** Berapa hasil maksimum diambil per kategori — dijaga kecil supaya jawaban tetap ringkas, bukan daftar panjang. */
const RESULTS_PER_CATEGORY = 2;

function toSource(hit: ContentSearchHit): AiSource {
  return {
    type: hit.type,
    slug: hit.slug,
    title: hit.title,
    excerpt: hit.excerpt,
    score: hit.score,
  };
}

/**
 * Mode Offline — implementasi `AiProvider` yang TIDAK pernah
 * menyentuh network. Jawabannya disusun murni dari pencarian materi
 * Markdown lokal (doa, artikel, afirmasi) lewat `ContentSearchPort` yang
 * di-inject lewat constructor (lihat penjelasan DI lengkap di
 * `ports/content-search.port.ts`).
 *
 * Class ini TIDAK tahu apa pun soal IndexedDB, `searchService`, atau
 * `public/search-data.json` — satu-satunya kontrak yang ia pegang adalah
 * `ContentSearchPort`. Ini membuatnya bisa diuji dengan port palsu (mock)
 * tanpa browser sama sekali, dan bisa dipindah ke sumber data lain kapan
 * pun tanpa mengubah satu baris pun di file ini.
 */
export class OfflineAiProvider implements AiProvider {
  readonly info: AiProviderInfo = {
    id: "offline-search",
    mode: "offline",
    label: "Pencarian Offline",
  };

  constructor(private readonly contentSearch: ContentSearchPort) {}

  async isAvailable(): Promise<boolean> {
    return this.contentSearch.isReady();
  }

  async ask(input: AiAskInput): Promise<AiReply> {
    const { question } = input;

    const [doa, artikel, afirmasi] = await Promise.all([
      this.contentSearch.searchDoa(question, RESULTS_PER_CATEGORY),
      this.contentSearch.searchArtikel(question, RESULTS_PER_CATEGORY),
      this.contentSearch.searchAfirmasi(question, RESULTS_PER_CATEGORY),
    ]);

    return {
      content: buildOfflineReplyText(question, { doa, artikel, afirmasi }),
      sources: [...doa, ...artikel, ...afirmasi].map(toSource),
      providerId: this.info.id,
      mode: this.info.mode,
    };
  }
}
