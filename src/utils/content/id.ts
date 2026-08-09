import type { ContentType } from "@/types/content";

/**
 * Kunci komposit `${type}:${slug}`, dipakai sebagai `ContentItem.id`.
 * Format ini selaras dengan konvensi yang sudah ada di
 * `src/lib/db/models.ts` (`FavoriteRecord.id = "${type}:${refId}"`) supaya
 * mudah dipetakan ke fitur favorit/progress yang sudah berjalan.
 */
export function toContentId(type: ContentType, slug: string): string {
  return `${type}:${slug}`;
}

export function parseContentId(id: string): { type: ContentType; slug: string } | null {
  const separatorIndex = id.indexOf(":");
  if (separatorIndex === -1) return null;

  const type = id.slice(0, separatorIndex) as ContentType;
  const slug = id.slice(separatorIndex + 1);
  if (!slug) return null;

  return { type, slug };
}

/** Turunkan slug dari nama file, mis. `"doa-anak.md"` -> `"doa-anak"`. */
export function slugFromFilename(filename: string): string {
  return filename.replace(/\.md$/i, "");
}
