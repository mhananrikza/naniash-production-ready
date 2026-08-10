import { Heart, Users, User, Sparkles, Moon, HandHeart } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface AfirmasiCategory {
  slug: string;
  name: string;
  icon: LucideIcon;
}

/**
 * Taksonomi kategori halaman `/afirmasi` — diturunkan dari nilai
 * `category` yang benar-benar dipakai di frontmatter
 * `content/afirmasi/*.md`. Sama pola dengan `config/doa.ts`.
 */
export const afirmasiCategories: AfirmasiCategory[] = [
  { slug: "emosi", name: "Emosi", icon: Heart },
  { slug: "hubungan-anak", name: "Hubungan Anak", icon: Users },
  { slug: "identitas-diri", name: "Identitas Diri", icon: User },
  { slug: "inner-healing", name: "Inner Healing", icon: Sparkles },
  { slug: "lelah", name: "Lelah", icon: Moon },
  { slug: "spiritual", name: "Spiritual", icon: HandHeart },
];

export function getAfirmasiCategoryBySlug(slug: string): AfirmasiCategory | undefined {
  return afirmasiCategories.find((category) => category.slug === slug);
}
