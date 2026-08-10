import type { Metadata } from "next";

import { getAllContent } from "@/services/content";
import { FavoritPageClient } from "@/components/favorit/favorit-page-client";

export const metadata: Metadata = {
  title: "Favorit — Hadiah dari Langit",
  description: "Doa, dzikir, afirmasi, dan artikel yang sudah Bunda tandai favorit.",
};

/**
 * Halaman Favorit. Server Component ini yang menyentuh `fs` lewat
 * Content Engine (`getAllContent()`) — sama seperti `app/(app)/library/page.tsx`
 * — supaya `FavoritPageClient` (Client Component, baca IndexedDB lewat
 * `favoritesService`) tinggal mencocokkan slug tanpa perlu tahu detail
 * pembacaan Markdown.
 */
export default function FavoritPage() {
  const items = getAllContent();

  return <FavoritPageClient items={items} />;
}
