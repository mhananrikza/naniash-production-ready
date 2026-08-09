/**
 * Helper untuk membaca field frontmatter secara aman. `gray-matter`
 * mengembalikan `data: Record<string, unknown>` tanpa jaminan tipe, jadi
 * setiap normalizer di `@/services/content/normalize.ts` memakai fungsi
 * di sini alih-alih mengakses field mentah langsung — memastikan tidak ada
 * `undefined`/tipe salah yang lolos ke `ContentItem`.
 */

export function toStringField(value: unknown, fallback = ""): string {
  return typeof value === "string" && value.trim().length > 0 ? value : fallback;
}

export function toOptionalStringField(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0 ? value : undefined;
}

export function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

export function toBooleanField(value: unknown, fallback = false): boolean {
  return typeof value === "boolean" ? value : fallback;
}

export function toNumberField(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

export function toDateField(value: unknown): string {
  if (typeof value === "string" && value.trim().length > 0) return value;
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return new Date().toISOString().slice(0, 10);
}

/**
 * Turunkan ringkasan otomatis dari body Markdown ketika `excerpt` tidak
 * diisi di frontmatter — dipakai sebagai fallback, bukan pengganti excerpt
 * yang ditulis manual (yang biasanya lebih enak dibaca).
 */
export function deriveExcerpt(markdown: string, maxLength = 160): string {
  const plain = markdown
    .replace(/^#+\s+.*$/gm, "") // buang heading
    .replace(/[*_>#`-]/g, "") // buang penanda Markdown umum
    .replace(/\s+/g, " ")
    .trim();

  if (plain.length <= maxLength) return plain;
  return `${plain.slice(0, maxLength).trimEnd()}…`;
}
