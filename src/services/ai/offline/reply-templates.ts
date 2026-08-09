import type { ContentSearchHit } from "../ports/content-search.port";

/**
 * MURNI (pure) — hanya menyusun teks dari data yang sudah ada, tidak
 * menyentuh Search Engine/IndexedDB/apa pun. Dipisah dari
 * `offline-ai-provider.ts` supaya nada bahasa & format jawaban Mode
 * Offline bisa diubah/diuji sendiri tanpa menyentuh logika pencarian.
 */

interface OfflineHits {
  doa: ContentSearchHit[];
  artikel: ContentSearchHit[];
  afirmasi: ContentSearchHit[];
}

function listLine(label: string, hits: ContentSearchHit[]): string | null {
  if (hits.length === 0) return null;
  const items = hits.map((hit) => `"${hit.title}"`).join(", ");
  return `${label}: ${items}.`;
}

/**
 * Susun jawaban Mode Offline dari hasil pencarian Markdown. Sengaja tidak
 * "menjawab" pertanyaan secara bebas (Mode Offline bukan model bahasa) —
 * hanya menunjukkan materi paling relevan dari perpustakaan lokal,
 * serapi mungkin, plus ajakan membuka salah satunya.
 */
export function buildOfflineReplyText(question: string, hits: OfflineHits): string {
  const lines = [
    listLine("Doa yang mungkin relevan", hits.doa),
    listLine("Artikel terkait", hits.artikel),
    listLine("Afirmasi yang cocok", hits.afirmasi),
  ].filter((line): line is string => line !== null);

  if (lines.length === 0) {
    return (
      `Aku belum menemukan materi yang cocok untuk "${question}" di perpustakaan lokal. ` +
      "Coba kata kunci lain, ya — atau nyalakan Mode Online nanti untuk jawaban yang lebih luwes."
    );
  }

  return [
    `Aku mencari "${question}" di perpustakaan lokal, ini yang paling relevan:`,
    ...lines,
    "Ketuk salah satu untuk membacanya selengkapnya.",
  ].join("\n");
}
