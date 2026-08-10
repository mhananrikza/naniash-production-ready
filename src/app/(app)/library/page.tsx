import type { Metadata } from "next";

import { getAllContent } from "@/services/content";
import { LibraryPageClient } from "@/components/library/library-page-client";

export const metadata: Metadata = {
  title: "Perpustakaan — Hadiah dari Langit",
  description: "Kumpulan materi seputar kehamilan, persalinan, dan pengasuhan untuk Bunda.",
};

/**
 * Halaman Perpustakaan. Server Component ini yang menyentuh `fs`, lewat
 * Content Engine (`@/services/content`) — SUMBER TUNGGAL untuk seluruh
 * jenis materi (`doa`, `dzikir`, `afirmasi`, `artikel`), bukan hanya
 * artikel seperti versi lama (`@/lib/library`, yang tetap dipakai
 * `app/(app)/library/[slug]` serta Home — lihat catatan di file itu).
 *
 * `getAllContent()` sudah mengembalikan bentuk *meta* (tanpa body
 * Markdown) yang diurutkan terbaru lebih dulu, jadi tidak perlu diproses
 * ulang di sini — payload yang dikirim ke Client Component tetap ringan.
 */
export default function LibraryPage() {
  const items = getAllContent();

  return <LibraryPageClient items={items} />;
}
