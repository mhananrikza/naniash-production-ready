import type { Metadata } from "next";

import { getAllContent } from "@/services/content";
import { AfirmasiPageClient } from "@/components/afirmasi/afirmasi-page-client";
import type { AfirmasiContentMeta } from "@/components/afirmasi/afirmasi-card";

export const metadata: Metadata = {
  title: "Afirmasi — Hadiah dari Langit",
  description: "Kumpulan afirmasi harian untuk menguatkan hati Bunda.",
};

/**
 * Halaman `/afirmasi` — dituju `QuickAccess` di Home dan
 * `contentTypeMeta.afirmasi.indexHref` (`src/config/content-type.ts`).
 * Pola identik `/doa` dan `/dzikir`: Server Component memanggil Content
 * Engine (`getAllContent({ type: "afirmasi" })`, membaca `fs` lewat
 * `@/services/content`), hasilnya (metadata ringkas tanpa body Markdown)
 * diteruskan ke `AfirmasiPageClient` untuk interaksi (search, filter,
 * favorit).
 *
 * Data BUKAN dummy/hardcoded — seluruh 30 item afirmasi datang langsung
 * dari file Markdown di `content/afirmasi/*.md` lewat Content Engine
 * yang sama dipakai `/doa`, `/dzikir`, `/content/[slug]`, dan Daily
 * Journey.
 */
export default function AfirmasiPage() {
  const afirmasiItems = getAllContent({ type: "afirmasi" }).filter(
    (item): item is AfirmasiContentMeta => item.type === "afirmasi"
  );

  return <AfirmasiPageClient items={afirmasiItems} />;
}
