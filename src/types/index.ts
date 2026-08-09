/**
 * Tipe domain inti, selaras dengan skema Phase 1:
 * content_categories, doa, afirmasi, tirakat_items, profiles.
 * Perluas seiring migrasi Supabase bertambah — jangan biarkan drift
 * dari `supabase/migrations`.
 */

/**
 * Tipe Content Engine (`content/{doa,dzikir,afirmasi,artikel}/*.md`)
 * di-re-export di sini supaya `import type { ContentItem } from "@/types"`
 * tetap berfungsi seperti tipe domain lain. Definisi sumber ada di
 * `@/types/content` — lihat file itu untuk dokumentasi lengkap.
 */
export type {
  ContentType,
  ContentBase,
  DoaContent,
  DzikirContent,
  AfirmasiContent,
  ArtikelContent,
  ContentItem,
  ContentItemMeta,
  ContentQueryOptions,
  SearchContentOptions,
  ContentSearchResult,
  ContentProgressEntry,
  ContinueReadingItem,
} from "./content";
export { CONTENT_TYPES } from "./content";

export interface Profile {
  id: string;
  displayName: string;
  createdAt: string;
}

export interface ContentCategory {
  id: string;
  slug: string;
  name: string;
}

export interface Doa {
  id: string;
  categoryId: string;
  title: string;
  arabicText: string;
  latinText: string;
  translationId: string;
  /** Konteks "dibaca saat" — dipakai untuk pencarian situasional Phase 2. */
  context: string[];
  isFavorite?: boolean;
}

export interface Afirmasi {
  id: string;
  text: string;
  date: string;
}

export interface TirakatItem {
  id: string;
  title: string;
  description?: string;
}

export interface TirakatLog {
  id: string;
  tirakatItemId: string;
  profileId: string;
  date: string;
  completed: boolean;
}

/**
 * Domain Perpustakaan (Library) — dipertahankan untuk kompatibilitas
 * dengan halaman `app/(app)/library/*` yang sudah ada. Sumber datanya kini
 * Content Engine (`@/services/content`, membaca `content/artikel/*.md`);
 * `@/lib/library.ts` hanya memetakan `ArtikelContent` ke bentuk di bawah
 * ini. Kode baru sebaiknya memakai `ArtikelContent` dari Content Engine
 * langsung, bukan tipe `LibraryArticle*` di bawah ini.
 */

/** Metadata artikel tanpa body Markdown — dipakai di halaman daftar/kartu. */
export interface LibraryArticleMeta {
  slug: string;
  title: string;
  excerpt: string;
  /** Slug kategori, lihat `config/library.ts`. */
  category: string;
  tags: string[];
  author: string;
  /** ISO date string, mis. "2026-07-28". */
  publishedAt: string;
  readingTimeMinutes: number;
  /** Emoji sampul — ringan, tanpa perlu aset gambar. */
  coverEmoji: string;
}

/** Artikel lengkap dengan body Markdown — dipakai di halaman detail. */
export interface LibraryArticle extends LibraryArticleMeta {
  content: string;
}
