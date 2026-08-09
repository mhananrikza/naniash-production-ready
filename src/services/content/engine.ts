import { readContentFolder } from "./loader";
import { normalizeAfirmasi, normalizeArtikel, normalizeDoa, normalizeDzikir } from "./normalize";
import type {
  ContentItem,
  ContentItemMeta,
  ContentProgressEntry,
  ContentQueryOptions,
  ContentSearchResult,
  ContentType,
  ContinueReadingItem,
  SearchContentOptions,
} from "@/types/content";
import { byPublishedAtDesc, byUpdatedAtDesc, scoreContentItem } from "@/utils/content";

/**
 * Content Engine — API tunggal yang dipakai seluruh aplikasi untuk
 * mengambil materi doa, dzikir, afirmasi, dan artikel. Semua fungsi di
 * sini membaca file Markdown lokal di `/content` (lewat `./loader` dan
 * `./normalize`), tidak pernah memanggil API/network.
 *
 * Hanya boleh diimpor dari Server Component / server-side code, karena
 * rantai pemanggilannya berujung ke `fs` (lihat `./loader.ts`).
 */

const FOLDER_BY_TYPE: Record<ContentType, string> = {
  doa: "doa",
  dzikir: "dzikir",
  afirmasi: "afirmasi",
  artikel: "artikel",
};

// Cache in-memory per proses server — konten statis, cukup dibaca sekali
// per cold start. Pola ini sama dengan cache tunggal di `lib/library.ts`
// versi lama, hanya diperluas jadi per-jenis-konten.
const cacheByType = new Map<ContentType, ContentItem[]>();

function loadContentType(type: ContentType): ContentItem[] {
  const cached = cacheByType.get(type);
  if (cached) return cached;

  const rawFiles = readContentFolder(FOLDER_BY_TYPE[type]);

  let items: ContentItem[];
  switch (type) {
    case "doa":
      items = rawFiles.map(normalizeDoa);
      break;
    case "dzikir":
      items = rawFiles.map(normalizeDzikir);
      break;
    case "afirmasi":
      items = rawFiles.map(normalizeAfirmasi);
      break;
    case "artikel":
      items = rawFiles.map(normalizeArtikel);
      break;
  }

  items.sort(byPublishedAtDesc);
  cacheByType.set(type, items);
  return items;
}

/** Semua item lengkap (termasuk body Markdown) lintas jenis yang diminta. */
function loadContent(types: ContentType[]): ContentItem[] {
  return types.flatMap(loadContentType).sort(byPublishedAtDesc);
}

function resolveTypes(type?: ContentType | ContentType[]): ContentType[] {
  if (!type) return ["doa", "dzikir", "afirmasi", "artikel"];
  return Array.isArray(type) ? type : [type];
}

function toMeta(item: ContentItem): ContentItemMeta {
  const { content: _content, ...meta } = item;
  return meta as ContentItemMeta;
}

function applyLimit<T>(items: T[], limit?: number): T[] {
  return typeof limit === "number" ? items.slice(0, limit) : items;
}

// ---------------------------------------------------------------------------
// API publik
// ---------------------------------------------------------------------------

/**
 * Ambil semua konten (ringkas, tanpa body) sesuai filter jenis, diurutkan
 * dari yang terbaru. Gunakan untuk halaman daftar/index per kategori.
 */
export function getAllContent(options: ContentQueryOptions = {}): ContentItemMeta[] {
  const types = resolveTypes(options.type);
  const items = loadContent(types).map(toMeta);
  return applyLimit(items, options.limit);
}

/**
 * Ambil satu konten lengkap (termasuk body Markdown) berdasarkan jenis dan
 * slug. Dipakai di halaman detail. Mengembalikan `null` jika tidak ada,
 * bukan melempar error, supaya pemanggil bisa langsung `notFound()`.
 */
export function getContentBySlug(type: ContentType, slug: string): ContentItem | null {
  const items = loadContentType(type);
  return items.find((item) => item.slug === slug) ?? null;
}

/**
 * Ambil satu konten lengkap berdasarkan slug SAJA, tanpa perlu tahu jenis
 * kontennya lebih dulu — dipakai halaman reader universal `/content/[slug]`
 * (lihat Prompt 22) yang menerima link dari Home/Library tanpa membawa
 * info `type` di URL. Mencoba tiap jenis konten sampai ketemu; slug antar
 * jenis konten tidak pernah bentrok (prefix nama file per folder), jadi
 * aman dipakai sebagai satu-satunya kunci pencarian.
 */
export function findContentBySlug(slug: string): ContentItem | null {
  for (const type of resolveTypes()) {
    const match = getContentBySlug(type, slug);
    if (match) return match;
  }
  return null;
}

/**
 * Ambil konten berdasarkan kategori tematik (mis. "kehamilan",
 * "anak-laki-laki"), opsional dibatasi jenis konten tertentu.
 */
export function getContentByCategory(
  category: string,
  options: ContentQueryOptions = {}
): ContentItemMeta[] {
  const types = resolveTypes(options.type);
  const items = loadContent(types)
    .filter((item) => item.category === category)
    .map(toMeta);
  return applyLimit(items, options.limit);
}

/**
 * Cari konten lintas jenis berdasarkan query bebas teks. Menggunakan
 * scoring berbobot field (lihat `@/utils/content/search.ts`) — tanpa
 * dependency pencarian eksternal. Hasil diurutkan dari skor tertinggi;
 * item dengan skor 0 (tidak cocok sama sekali) tidak disertakan.
 */
export function searchContent(
  query: string,
  options: SearchContentOptions = {}
): ContentSearchResult[] {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) return [];

  const types = resolveTypes(options.type);
  let items = loadContent(types).map(toMeta);

  if (options.category) {
    items = items.filter((item) => item.category === options.category);
  }

  const results = items
    .map((item): ContentSearchResult => {
      const { score, matchedFields } = scoreContentItem(item, trimmedQuery);
      return { item, score, matchedFields };
    })
    .filter((result) => result.score > 0)
    .sort((a, b) => b.score - a.score);

  return applyLimit(results, options.limit);
}

/** Konten terbaru berdasarkan `publishedAt`, opsional difilter jenis/kategori. */
export function getLatestContent(options: SearchContentOptions = {}): ContentItemMeta[] {
  const types = resolveTypes(options.type);
  let items = loadContent(types).map(toMeta);

  if (options.category) {
    items = items.filter((item) => item.category === options.category);
  }

  return applyLimit(items, options.limit ?? 10);
}

/**
 * Konten yang ditandai `featured: true` di frontmatter. Jika tidak ada
 * satu pun yang ditandai untuk filter yang diberikan, jatuh kembali ke
 * konten terbaru — supaya section "Pilihan" di UI tidak pernah kosong
 * hanya karena belum ada yang ditandai featured.
 */
export function getFeaturedContent(options: ContentQueryOptions = {}): ContentItemMeta[] {
  const types = resolveTypes(options.type);
  const items = loadContent(types).map(toMeta);
  const featured = items.filter((item) => item.featured);

  const result = featured.length > 0 ? featured : items;
  return applyLimit(result, options.limit ?? 5);
}

/**
 * Cocokkan entri progres baca (dipasok pemanggil — lihat
 * `ContentProgressEntry` di `@/types/content`) dengan data konten yang
 * masih ada, lalu urutkan dari yang terakhir dibaca. Content Engine
 * sengaja tidak menyimpan progres sendiri: penyimpanan (localStorage,
 * IndexedDB, atau Supabase) adalah tanggung jawab pemanggil, bukan engine
 * ini — menjaga engine tetap murni "baca konten", reusable di context apa
 * pun (client hook, server component, dsb).
 *
 * Entri dengan `progress` 0 atau id yang tidak lagi ada di `/content`
 * (mis. file sudah dihapus) otomatis diabaikan.
 */
export function getContinueReading(
  progressEntries: ContentProgressEntry[],
  options: ContentQueryOptions = {}
): ContinueReadingItem[] {
  const types = resolveTypes(options.type);
  const items = loadContent(types);
  const itemById = new Map(items.map((item) => [item.id, item]));

  const result = progressEntries
    .filter((entry) => entry.progress > 0)
    .map((entry): ContinueReadingItem | null => {
      const match = itemById.get(entry.id);
      if (!match) return null;
      return { item: toMeta(match), progress: entry.progress, updatedAt: entry.updatedAt };
    })
    .filter((entry): entry is ContinueReadingItem => entry !== null)
    .sort(byUpdatedAtDesc);

  return applyLimit(result, options.limit);
}
