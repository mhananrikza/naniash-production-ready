import { Sun, HeartPulse } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface DzikirCategory {
  slug: string;
  name: string;
  icon: LucideIcon;
}

/**
 * Taksonomi kategori halaman `/dzikir` — diturunkan dari nilai `category`
 * yang benar-benar dipakai di frontmatter `content/dzikir/*.md`. Sama pola
 * dengan `config/doa.ts`.
 */
export const dzikirCategories: DzikirCategory[] = [
  { slug: "harian", name: "Harian", icon: Sun },
  { slug: "ketenangan-hati", name: "Ketenangan Hati", icon: HeartPulse },
];

export function getDzikirCategoryBySlug(slug: string): DzikirCategory | undefined {
  return dzikirCategories.find((category) => category.slug === slug);
}
