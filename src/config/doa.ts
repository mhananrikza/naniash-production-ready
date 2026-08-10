import { Baby, Flower2, HeartHandshake, Users, Compass } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface DoaCategory {
  slug: string;
  name: string;
  icon: LucideIcon;
}

/**
 * Taksonomi kategori halaman `/doa` — diturunkan dari nilai `category`
 * yang benar-benar dipakai di frontmatter `content/doa/*.md`. Sama pola
 * dengan `config/dzikir.ts` dan `config/afirmasi.ts`.
 */
export const doaCategories: DoaCategory[] = [
  { slug: "anak-laki-laki", name: "Anak Laki-laki", icon: Baby },
  { slug: "anak-perempuan", name: "Anak Perempuan", icon: Flower2 },
  { slug: "fitrah-akhlak", name: "Fitrah & Akhlak", icon: HeartHandshake },
  { slug: "orangtua", name: "Orangtua", icon: Users },
  { slug: "tantangan-dunia", name: "Tantangan Dunia", icon: Compass },
];

export function getDoaCategoryBySlug(slug: string): DoaCategory | undefined {
  return doaCategories.find((category) => category.slug === slug);
}
