import type { Metadata } from "next";

import { getAllArticles } from "@/lib/library";
import { LibraryPageClient } from "@/components/library/library-page-client";

export const metadata: Metadata = {
  title: "Perpustakaan — Hadiah dari Langit",
  description: "Kumpulan materi seputar kehamilan, persalinan, dan pengasuhan untuk Bunda.",
};

/**
 * Halaman Perpustakaan. Server Component ini yang menyentuh `fs` lewat
 * `lib/library.ts`; body Markdown (`content`) sengaja dibuang sebelum
 * dikirim ke Client Component supaya payload daftar tetap ringan —
 * body lengkap baru diambil di halaman detail `[slug]`.
 */
export default function LibraryPage() {
  const articles = getAllArticles().map((article) => {
    const { slug, title, excerpt, category, tags, author, publishedAt, readingTimeMinutes, coverEmoji } =
      article;
    return { slug, title, excerpt, category, tags, author, publishedAt, readingTimeMinutes, coverEmoji };
  });

  return <LibraryPageClient articles={articles} />;
}
