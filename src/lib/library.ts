import { getAllContent, getContentBySlug } from "@/services/content";
import type { ArtikelContent, LibraryArticle } from "@/types";

/**
 * Shim kompatibilitas untuk halaman Perpustakaan yang sudah ada
 * (`app/(app)/library/*`). Implementasi loader Markdown yang sebenarnya
 * sudah dipindah ke Content Engine (`@/services/content`, membaca dari
 * `content/artikel/*.md`) — file ini hanya memetakan `ArtikelContent`
 * kembali ke bentuk `LibraryArticle` lama, supaya halaman & komponen UI
 * yang sudah ada tidak perlu diubah sama sekali.
 *
 * Untuk kode baru, pakai `@/services/content` langsung
 * (`getContentByCategory("artikel", ...)`, dsb.) alih-alih modul ini.
 */

function toLibraryArticle(article: ArtikelContent): LibraryArticle {
  const { id: _id, type: _type, featured: _featured, ...libraryArticle } = article;
  return libraryArticle;
}

export function getAllArticles(): LibraryArticle[] {
  return getAllContent({ type: "artikel" }).map((meta) => {
    const full = getContentBySlug("artikel", meta.slug);
    // `getAllContent` tidak menyertakan body Markdown (by design, lihat
    // dokumentasi di `services/content/engine.ts`); di sini body memang
    // dibutuhkan karena `LibraryArticle` lama menyertakan `content`.
    return toLibraryArticle(full as ArtikelContent);
  });
}

export function getArticleBySlug(slug: string): LibraryArticle | null {
  const article = getContentBySlug("artikel", slug);
  return article ? toLibraryArticle(article as ArtikelContent) : null;
}

export function getAllArticleSlugs(): string[] {
  return getAllContent({ type: "artikel" }).map((article) => article.slug);
}
