import type { Metadata } from "next";

import { getAllContent } from "@/services/content";
import { DzikirPageClient } from "@/components/dzikir/dzikir-page-client";
import type { DzikirContentMeta } from "@/components/dzikir/dzikir-card";

export const metadata: Metadata = {
  title: "Dzikir — Hadiah dari Langit",
  description: "Kumpulan dzikir harian untuk menjaga ketenangan hati.",
};

/**
 * Halaman `/dzikir` — dituju `QuickAccess` di Home dan
 * `contentTypeMeta.dzikir.indexHref` (`src/config/content-type.ts`).
 * Pola identik `/doa`: Server Component memanggil Content Engine
 * (`getAllContent({ type: "dzikir" })`, membaca `fs` lewat
 * `@/services/content`), hasilnya (metadata ringkas tanpa body Markdown)
 * diteruskan ke `DzikirPageClient` untuk interaksi (search, filter,
 * favorit).
 *
 * Data BUKAN dummy/hardcoded — seluruh 3 item dzikir datang langsung
 * dari file Markdown di `content/dzikir/*.md` lewat Content Engine yang
 * sama dipakai `/doa`, `/content/[slug]`, dan Daily Journey.
 */
export default function DzikirPage() {
  const dzikirItems = getAllContent({ type: "dzikir" }).filter(
    (item): item is DzikirContentMeta => item.type === "dzikir"
  );

  return <DzikirPageClient items={dzikirItems} />;
}
