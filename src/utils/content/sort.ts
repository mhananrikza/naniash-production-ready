import type { ContentItemMeta } from "@/types/content";

/** Comparator: tanggal publikasi terbaru lebih dulu. */
export function byPublishedAtDesc(a: ContentItemMeta, b: ContentItemMeta): number {
  return +new Date(b.publishedAt) - +new Date(a.publishedAt);
}

/** Comparator: `updatedAt` terbaru lebih dulu — dipakai untuk Continue Reading. */
export function byUpdatedAtDesc(a: { updatedAt: string }, b: { updatedAt: string }): number {
  return +new Date(b.updatedAt) - +new Date(a.updatedAt);
}
