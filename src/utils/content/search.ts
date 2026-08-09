import type { ContentItemMeta } from "@/types/content";

/**
 * Pencarian sederhana berbasis substring + bobot per field — cukup untuk
 * ukuran konten statis di aplikasi ini, tanpa perlu library pencarian
 * eksternal. Jika volume konten membesar drastis, ini titik yang tepat
 * untuk diganti dengan index seperti FlexSearch/Fuse tanpa mengubah
 * kontrak `searchContent()` di `@/services/content`.
 */

interface FieldWeight {
  field: string;
  weight: number;
  getValue: (item: ContentItemMeta) => string | string[] | undefined;
}

const FIELD_WEIGHTS: FieldWeight[] = [
  { field: "title", weight: 5, getValue: (item) => item.title },
  { field: "tags", weight: 3, getValue: (item) => item.tags },
  { field: "category", weight: 2, getValue: (item) => item.category },
  { field: "excerpt", weight: 2, getValue: (item) => item.excerpt },
  {
    // Gabungan field khas per jenis konten: teks afirmasi, atau latin +
    // terjemahan doa/dzikir — supaya pencarian "kesabaran" atau "istighfar"
    // tetap menemukan item yang relevan meski tidak ada di title/tags.
    field: "text",
    weight: 4,
    getValue: (item) => {
      if (item.type === "afirmasi") return item.text;
      if (item.type === "doa" || item.type === "dzikir") {
        return [item.latinText, item.translationId, item.context.join(" ")].join(" ");
      }
      return undefined;
    },
  },
];

function normalize(value: string): string {
  return value.toLowerCase().normalize("NFKD").trim();
}

export interface ScoredMatch {
  score: number;
  matchedFields: string[];
}

/** Hitung skor relevansi satu item terhadap query. Skor 0 = tidak cocok. */
export function scoreContentItem(item: ContentItemMeta, query: string): ScoredMatch {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) return { score: 0, matchedFields: [] };

  const terms = normalizedQuery.split(/\s+/).filter(Boolean);
  let score = 0;
  const matchedFields: string[] = [];

  for (const { field, weight, getValue } of FIELD_WEIGHTS) {
    const raw = getValue(item);
    if (!raw) continue;

    const text = normalize(Array.isArray(raw) ? raw.join(" ") : raw);
    if (!text) continue;

    let fieldMatched = false;
    for (const term of terms) {
      if (!text.includes(term)) continue;
      fieldMatched = true;
      score += weight;
      if (text === normalizedQuery) score += weight * 2;
      else if (text.startsWith(normalizedQuery)) score += weight;
    }

    if (fieldMatched) matchedFields.push(field);
  }

  return { score, matchedFields };
}
