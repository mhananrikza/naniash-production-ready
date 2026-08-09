import { Sparkles, HeartPulse, Baby, Users, HandHeart, Brain } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface LibraryCategory {
  slug: string;
  name: string;
  icon: LucideIcon;
}

/**
 * Satu sumber taksonomi kategori Perpustakaan — dipakai untuk chip filter,
 * badge di kartu artikel, dan halaman detail. Tambahkan kategori baru di
 * sini saja; frontmatter Markdown cukup mereferensikan `slug`-nya.
 */
export const libraryCategories: LibraryCategory[] = [
  { slug: "kehamilan", name: "Kehamilan", icon: Sparkles },
  { slug: "persalinan", name: "Persalinan", icon: HeartPulse },
  { slug: "menyusui", name: "Menyusui", icon: Baby },
  { slug: "parenting", name: "Pengasuhan", icon: Users },
  { slug: "doa-dzikir", name: "Doa & Dzikir", icon: HandHeart },
  { slug: "kesehatan-mental", name: "Kesehatan Mental", icon: Brain },
];

export function getCategoryBySlug(slug: string): LibraryCategory | undefined {
  return libraryCategories.find((category) => category.slug === slug);
}
