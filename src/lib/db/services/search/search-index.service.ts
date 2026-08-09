import { searchDocumentsRepository } from "../../repository/search-documents.repository";
import { searchTermsRepository } from "../../repository/search-terms.repository";
import { settingsService } from "../settings.service";
import { countTermFrequencies, tokenize } from "@/utils/search";
import type { SearchDocumentRecord, SearchField, SearchPosting, SearchTermRecord } from "../../models";
import type { SearchDataFile, SearchIndexStatus } from "@/types/search";

/**
 * ---------------------------------------------------------------------------
 * STRATEGI INDEXING — ringkasan (detail lengkap ada di README.md sebelah)
 * ---------------------------------------------------------------------------
 * 1. Data sumber (`public/search-data.json`) dihasilkan di BUILD TIME
 *    (`scripts/generate-search-data.mjs`), bukan dibaca dari `fs` saat
 *    runtime — supaya bisa jadi aset statis yang di-precache service
 *    worker dan dibaca client 100% offline.
 * 2. Dari data itu, di sini kita bangun INVERTED INDEX: untuk tiap token
 *    unik di seluruh dokumen (title, isi, kategori, tag), simpan daftar
 *    dokumen yang mengandung token tsb (posting list) beserta term
 *    frequency-nya. Ini kebalikan dari representasi "dokumen -> daftar
 *    kata" (forward index) — makanya query "kata apa saja yang ada di
 *    dokumen X" jadi lambat, tapi query "dokumen apa saja yang mengandung
 *    kata Y" (yaitu, PENCARIAN) jadi sangat cepat: tinggal satu key
 *    lookup di `searchTerms`, bukan scan seluruh dokumen.
 * 3. Index ini di-PERSIST ke IndexedDB (bukan dibangun ulang tiap kali app
 *    dibuka) dan hanya dibangun ulang kalau `version` (hash isi konten)
 *    berubah — lihat `ensureIndexReady()`. Ini membuat biaya
 *    tokenizing/indexing (yang sebanding dengan total kata di seluruh
 *    konten) hanya terjadi SEKALI per perubahan konten, bukan per
 *    pencarian atau per buka app.
 */

const SEARCH_DATA_URL = "/search-data.json";
const INDEX_VERSION_SETTINGS_KEY = "searchIndexVersion";

/** Field yang ditokenize per dokumen — harus selaras dengan `SearchField` di `../../models`. */
function fieldTextsOf(doc: SearchDataFile["documents"][number]): Record<SearchField, string> {
  return {
    title: doc.title,
    content: doc.contentText,
    category: doc.category,
    tags: doc.tags.join(" "),
  };
}

async function fetchSearchData(): Promise<SearchDataFile> {
  // `force-cache`: file ini immutable per `version` (nama file sama, tapi
  // isinya berubah tiap build) dan sudah di-precache service worker —
  // aman & disarankan diambil dari cache HTTP lebih dulu, browser/SW yang
  // menentukan kapan perlu revalidate.
  const response = await fetch(SEARCH_DATA_URL, { cache: "force-cache" });
  if (!response.ok) {
    throw new Error(`Gagal mengambil ${SEARCH_DATA_URL} (status ${response.status}).`);
  }
  return (await response.json()) as SearchDataFile;
}

/**
 * Tokenize seluruh dokumen lalu susun jadi inverted index in-memory
 * (`Map<token, ...>`), baru ditulis ke IndexedDB sekali di akhir lewat
 * `replaceAll` (bukan `put` satu-satu per token per dokumen) — jauh lebih
 * sedikit transaksi IndexedDB dibanding menulis sambil jalan.
 */
function buildInvertedIndex(data: SearchDataFile): {
  documents: SearchDocumentRecord[];
  terms: SearchTermRecord[];
} {
  const documents: SearchDocumentRecord[] = [];
  const termMap = new Map<string, { postings: SearchPosting[]; docIds: Set<string> }>();

  for (const doc of data.documents) {
    documents.push({
      id: doc.id,
      slug: doc.slug,
      type: doc.type,
      title: doc.title,
      category: doc.category,
      tags: doc.tags,
      excerpt: doc.excerpt,
    });

    const fieldTexts = fieldTextsOf(doc);
    (Object.keys(fieldTexts) as SearchField[]).forEach((field) => {
      const tokens = tokenize(fieldTexts[field]);
      const frequencies = countTermFrequencies(tokens);

      frequencies.forEach((tf, term) => {
        let entry = termMap.get(term);
        if (!entry) {
          entry = { postings: [], docIds: new Set() };
          termMap.set(term, entry);
        }
        entry.postings.push({ id: doc.id, field, tf });
        entry.docIds.add(doc.id);
      });
    });
  }

  const terms: SearchTermRecord[] = Array.from(termMap.entries()).map(([term, { postings, docIds }]) => ({
    term,
    postings,
    df: docIds.size,
  }));

  return { documents, terms };
}

async function persistIndex(data: SearchDataFile): Promise<void> {
  const { documents, terms } = buildInvertedIndex(data);
  await searchDocumentsRepository.replaceAll(documents);
  await searchTermsRepository.replaceAll(terms);
  await settingsService.set(INDEX_VERSION_SETTINGS_KEY, data.version);
}

/** Mencegah dua pemanggil `ensureIndexReady()` bersamaan membangun index dua kali (mis. dua komponen mount bareng saat app dibuka). */
let inFlight: Promise<SearchIndexStatus> | null = null;

/**
 * Pastikan index siap dipakai — dipanggil sekali saat app dibuka (lihat
 * `SearchIndexInitializer`), aman dipanggil berkali-kali dari mana saja.
 *
 * Alur:
 * 1. Ambil `search-data.json` (dari cache SW kalau offline, dari network
 *    kalau online & ada versi lebih baru).
 * 2. Bandingkan `data.version` dengan versi tersimpan di `settings`
 *    (store yang sudah ada, dipakai ulang di sini sebagai "index meta" —
 *    lihat `settingsService`).
 * 3. Sama & `searchDocuments` tidak kosong -> index masih valid, TIDAK
 *    perlu tokenize ulang. Beda (atau `force: true`) -> bangun ulang.
 */
export async function ensureIndexReady(options: { force?: boolean } = {}): Promise<SearchIndexStatus> {
  if (inFlight) return inFlight;

  inFlight = (async (): Promise<SearchIndexStatus> => {
    try {
      const data = await fetchSearchData();
      const storedVersion = await settingsService.get<string | null>(INDEX_VERSION_SETTINGS_KEY, null);

      if (!options.force && storedVersion === data.version) {
        const documentCount = await searchDocumentsRepository.count();
        if (documentCount > 0) {
          return { state: "ready", version: data.version, documentCount };
        }
      }

      await persistIndex(data);
      return { state: "ready", version: data.version, documentCount: data.documents.length };
    } catch (error) {
      return {
        state: "error",
        message: error instanceof Error ? error.message : "Gagal membangun index pencarian.",
      };
    } finally {
      inFlight = null;
    }
  })();

  return inFlight;
}

/** Cek status index TANPA memicu fetch/build — dipakai untuk keperluan diagnosa/UI status ("index siap / belum"). */
export async function getIndexStatus(): Promise<SearchIndexStatus> {
  const version = await settingsService.get<string | null>(INDEX_VERSION_SETTINGS_KEY, null);
  if (!version) return { state: "empty" };

  const documentCount = await searchDocumentsRepository.count();
  if (documentCount === 0) return { state: "empty" };

  return { state: "ready", version, documentCount };
}
