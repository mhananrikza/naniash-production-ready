import type { Metadata } from "next";

import { getAllContent } from "@/services/content";
import { DoaPageClient } from "@/components/doa/doa-page-client";
import type { DoaContentMeta } from "@/components/doa/doa-card";

export const metadata: Metadata = {
  title: "Doa — Hadiah dari Langit",
  description: "Kumpulan doa harian untuk anak dan keluarga.",
};

/**
 * Halaman `/doa` — dituju `QuickAccess` di Home dan
 * `contentTypeMeta.doa.indexHref` (`src/config/content-type.ts`).
 * Pola identik `/dzikir` dan `/afirmasi`: Server Component memanggil
 * Content Engine (`getAllContent({ type: "doa" })`, membaca `fs` lewat
 * `@/services/content`), hasilnya (metadata ringkas tanpa body Markdown)
 * diteruskan ke `DoaPageClient` untuk interaksi (search, filter, favorit).
 *
 * Data BUKAN dummy/hardcoded — seluruh 90 item doa datang langsung dari
 * file Markdown di `content/doa/*.md` lewat Content Engine yang sama
 * dipakai `/dzikir`, `/afirmasi`, `/content/[slug]`, dan Daily Journey.
 */
export default function DoaPage() {
  const doaItems = getAllContent({ type: "doa" }).filter(
    (item): item is DoaContentMeta => item.type === "doa"
  );

  return <DoaPageClient items={doaItems} />;
}
