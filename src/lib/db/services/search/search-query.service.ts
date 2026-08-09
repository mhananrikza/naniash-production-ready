import { searchDocumentsRepository } from "../../repository/search-documents.repository";
import { searchTermsRepository } from "../../repository/search-terms.repository";
import { searchHistoryService } from "./search-history.service";
import { FIELD_WEIGHTS, tokenize } from "@/utils/search";
import type { SearchDocumentRecord, SearchField } from "../../models";
import type { SearchQueryOptions, SearchResultItem } from "@/types/search";

/**
 * ---------------------------------------------------------------------------
 * STRATEGI QUERY & SCORING
 * ---------------------------------------------------------------------------
 * Untuk tiap token query, kita ambil SEMUA term index yang berawalan token
 * itu lewat `searchTermsRepository.findByPrefix` (range query — lihat
 * dokumentasi di repository tsb). Term yang PERSIS sama dengan token diberi
 * bobot kecocokan penuh (exact match); term yang cuma diawali token diberi
 * bobot parsial (prefix match) — jadi mengetik "kesab" tetap menemukan
 * dokumen berisi "kesabaran" walau skornya sedikit lebih rendah daripada
 * dokumen yang benar-benar mengandung kata "kesab" persis.
 *
 * Skor tiap kecocokan token-di-field-di-dokumen:
 *
 *   skor = (1 + log(tf)) * bobotField * faktorJenisMatch * idf
 *
 * - `tf`  = term frequency (berapa kali token itu muncul di field itu pada
 *           dokumen itu) — `1 + log(tf)` supaya kemunculan ke-10 tidak
 *           bernilai 10x kemunculan pertama (diminishing returns), pola
 *           standar di information retrieval (log-tf weighting).
 * - `bobotField` = `FIELD_WEIGHTS` (title=5, tags=4, category=2, content=1)
 *           — kecocokan di judul jauh lebih berarti daripada kecocokan di
 *           tengah isi artikel yang panjang.
 * - `faktorJenisMatch` = 1 untuk exact match, `PREFIX_MATCH_FACTOR` untuk
 *           prefix match saja.
 * - `idf`  = log((totalDokumen + 1) / (df + 1)) + 1 — token yang muncul di
 *           hampir semua dokumen (mis. kata umum yang lolos stopword
 *           filter) otomatis kurang berpengaruh dibanding token yang cuma
 *           ada di segelintir dokumen — pola standar tf-idf.
 *
 * Skor per dokumen = jumlah skor dari semua token query yang cocok
 * (semantik "OR berbobot", bukan "AND ketat") — dokumen yang cocok di
 * lebih banyak token query otomatis naik peringkat karena skornya
 * terakumulasi, tanpa perlu logika AND/OR terpisah.
 *
 * Biaya query TIDAK bergantung pada total jumlah dokumen di database:
 * hanya bergantung pada (a) jumlah token di query pengguna (biasanya 1–5)
 * dan (b) jumlah dokumen yang benar-benar mengandung token itu (posting
 * list-nya) — bukan seluruh korpus. Ini yang membuat pencarian tetap cepat
 * walau jumlah artikel terus bertambah.
 */

/** Bobot skor untuk term yang HANYA cocok sebagai prefix (bukan exact match). */
const PREFIX_MATCH_FACTOR = 0.5;

/** Batas jumlah term index yang diperiksa per token query — jaga-jaga kalau token pendek (mis. 2 huruf) punya ratusan turunan prefix di korpus besar. */
const MAX_TERMS_PER_TOKEN = 40;

const DEFAULT_RESULT_LIMIT = 20;

interface AggregatedMatch {
  score: number;
  fields: Set<SearchField>;
}

function toResultItem(doc: SearchDocumentRecord, match: AggregatedMatch): SearchResultItem {
  return {
    id: doc.id,
    slug: doc.slug,
    type: doc.type,
    title: doc.title,
    category: doc.category,
    tags: doc.tags,
    excerpt: doc.excerpt,
    score: match.score,
    matchedFields: Array.from(match.fields),
  };
}

/**
 * Inti Search Engine. `options.fields` yang membedakan Search Judul / Isi /
 * Kategori / Tag — lihat fungsi pembantu `searchByTitle` dkk. di bawah
 * untuk pemakaian yang lebih ringkas.
 */
export async function search(query: string, options: SearchQueryOptions = {}): Promise<SearchResultItem[]> {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) return [];

  const tokens = tokenize(trimmedQuery);
  if (tokens.length === 0) return [];

  const allowedFields = options.fields && options.fields.length > 0 ? new Set(options.fields) : null;
  const typeFilter = options.type
    ? new Set(Array.isArray(options.type) ? options.type : [options.type])
    : null;

  const totalDocuments = await searchDocumentsRepository.count();
  const scoreByDocId = new Map<string, AggregatedMatch>();

  // Setiap token diproses independen (tidak saling menunggu hasil token
  // lain) lewat Promise.all — masing-masing hanya menyentuh IndexedDB lewat
  // satu range query (`findByPrefix`), bukan iterasi seluruh store.
  const tokenRecordPairs = await Promise.all(
    tokens.map(async (token) => ({
      token,
      records: await searchTermsRepository.findByPrefix(token, MAX_TERMS_PER_TOKEN),
    }))
  );

  for (const { token, records } of tokenRecordPairs) {
    for (const record of records) {
      const isExactMatch = record.term === token;
      const matchFactor = isExactMatch ? 1 : PREFIX_MATCH_FACTOR;
      const idf = Math.log((totalDocuments + 1) / (record.df + 1)) + 1;

      for (const posting of record.postings) {
        if (allowedFields && !allowedFields.has(posting.field)) continue;

        const fieldWeight = FIELD_WEIGHTS[posting.field];
        const termScore = (1 + Math.log(posting.tf)) * fieldWeight * matchFactor * idf;

        const existing = scoreByDocId.get(posting.id);
        if (existing) {
          existing.score += termScore;
          existing.fields.add(posting.field);
        } else {
          scoreByDocId.set(posting.id, { score: termScore, fields: new Set([posting.field]) });
        }
      }
    }
  }

  const ranked = Array.from(scoreByDocId.entries()).sort((a, b) => b[1].score - a[1].score);

  const limit = options.limit ?? DEFAULT_RESULT_LIMIT;
  const results: SearchResultItem[] = [];

  for (const [docId, match] of ranked) {
    if (results.length >= limit) break;

    const doc = await searchDocumentsRepository.getById(docId);
    if (!doc) continue; // dokumen sudah dihapus dari index tapi posting lama belum ke-cleanup (harusnya tidak terjadi sejak `replaceAll` selalu atomik per rebuild, tapi dijaga untuk keamanan)
    if (typeFilter && !typeFilter.has(doc.type)) continue;

    results.push(toResultItem(doc, match));
  }

  if (options.recordHistory !== false) {
    // "Diam-diam", tidak boleh menggagalkan pencarian kalau history gagal ditulis.
    searchHistoryService.record(trimmedQuery, results.length).catch(() => {});
  }

  return results;
}

/** Search Judul — hanya mencocokkan field `title`. */
export function searchByTitle(query: string, options: Omit<SearchQueryOptions, "fields"> = {}) {
  return search(query, { ...options, fields: ["title"] });
}

/** Search Isi — hanya mencocokkan field `content` (body Markdown yang sudah di-strip + field teks khas per jenis konten). */
export function searchByContent(query: string, options: Omit<SearchQueryOptions, "fields"> = {}) {
  return search(query, { ...options, fields: ["content"] });
}

/** Search Kategori — hanya mencocokkan field `category`. */
export function searchByCategory(query: string, options: Omit<SearchQueryOptions, "fields"> = {}) {
  return search(query, { ...options, fields: ["category"] });
}

/** Search Tag — pencarian token bebas yang dibatasi ke field `tags`. */
export function searchByTag(query: string, options: Omit<SearchQueryOptions, "fields"> = {}) {
  return search(query, { ...options, fields: ["tags"] });
}

/**
 * Browse tag secara EXACT (bukan tokenized) lewat index `multiEntry` di
 * `searchDocuments` — dipakai untuk kasus "tampilkan semua dokumen bertag
 * X" (mis. dari halaman kategori/tag), berbeda dari `searchByTag` yang
 * mencari token bebas di dalam tag.
 */
export async function findByExactTag(tag: string): Promise<SearchResultItem[]> {
  const docs = await searchDocumentsRepository.findByTag(tag);
  return docs.map((doc) => ({ ...doc, score: 1, matchedFields: ["tags"] as SearchField[] }));
}
