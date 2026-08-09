import { HandHeart, Repeat, Sun, BookOpen } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import type { ContentType } from "@/types/content";

export interface ContentTypeMeta {
  label: string;
  /** Halaman daftar per jenis (dipakai breadcrumb & tombol kembali). */
  indexHref: string;
  indexLabel: string;
  icon: LucideIcon;
}

/**
 * Metadata tampilan per jenis Content Engine — dipakai halaman Reader
 * (`/content/[slug]`) untuk breadcrumb, ikon, dan label yang konsisten
 * dengan `QuickAccess` di Home (`src/components/home/quick-access.tsx`).
 * Satu sumber di sini supaya label/ikon tidak drift antar halaman.
 */
export const contentTypeMeta: Record<ContentType, ContentTypeMeta> = {
  doa: { label: "Doa", indexHref: "/doa", indexLabel: "Doa", icon: HandHeart },
  dzikir: { label: "Dzikir", indexHref: "/dzikir", indexLabel: "Dzikir", icon: Repeat },
  afirmasi: { label: "Afirmasi", indexHref: "/afirmasi", indexLabel: "Afirmasi", icon: Sun },
  artikel: { label: "Artikel", indexHref: "/library", indexLabel: "Perpustakaan", icon: BookOpen },
};
