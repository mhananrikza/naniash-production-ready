import type { RawContentFile } from "./loader";
import type { ArtikelContent, AfirmasiContent, DoaContent, DzikirContent } from "@/types/content";
import {
  deriveExcerpt,
  estimateReadingTime,
  toBooleanField,
  toContentId,
  toDateField,
  toNumberField,
  toOptionalStringField,
  toStringArray,
  toStringField,
} from "@/utils/content";

/**
 * Mengubah `RawContentFile` (frontmatter mentah + body) menjadi bentuk
 * `ContentItem` yang sudah dijamin tipenya, dengan fallback yang masuk
 * akal untuk field opsional. Satu fungsi per jenis konten karena bentuk
 * frontmatter-nya berbeda (doa/dzikir punya arabicText, afirmasi punya
 * text, artikel punya author) — menjaga setiap normalizer tetap sederhana
 * dan mudah diuji, dibanding satu fungsi generik penuh percabangan.
 */

function baseTitle(raw: RawContentFile): string {
  return toStringField(raw.data.title, raw.slug);
}

function baseExcerpt(raw: RawContentFile, title: string): string {
  const explicit = toOptionalStringField(raw.data.excerpt);
  return explicit ?? deriveExcerpt(raw.body || title);
}

export function normalizeDoa(raw: RawContentFile): DoaContent {
  const title = baseTitle(raw);

  return {
    id: toContentId("doa", raw.slug),
    slug: raw.slug,
    type: "doa",
    title,
    category: toStringField(raw.data.category, "umum"),
    tags: toStringArray(raw.data.tags),
    excerpt: baseExcerpt(raw, title),
    publishedAt: toDateField(raw.data.publishedAt),
    featured: toBooleanField(raw.data.featured),
    coverEmoji: toStringField(raw.data.coverEmoji, "🤲"),
    content: raw.body,
    arabicText: toStringField(raw.data.arabicText),
    latinText: toStringField(raw.data.latinText),
    translationId: toStringField(raw.data.translationId),
    dalil: toOptionalStringField(raw.data.dalil),
    context: toStringArray(raw.data.context),
  };
}

export function normalizeDzikir(raw: RawContentFile): DzikirContent {
  const title = baseTitle(raw);

  return {
    id: toContentId("dzikir", raw.slug),
    slug: raw.slug,
    type: "dzikir",
    title,
    category: toStringField(raw.data.category, "umum"),
    tags: toStringArray(raw.data.tags),
    excerpt: baseExcerpt(raw, title),
    publishedAt: toDateField(raw.data.publishedAt),
    featured: toBooleanField(raw.data.featured),
    coverEmoji: toStringField(raw.data.coverEmoji, "📿"),
    content: raw.body,
    arabicText: toStringField(raw.data.arabicText),
    latinText: toStringField(raw.data.latinText),
    translationId: toStringField(raw.data.translationId),
    repeatCount: toNumberField(raw.data.repeatCount),
    context: toStringArray(raw.data.context),
  };
}

export function normalizeAfirmasi(raw: RawContentFile): AfirmasiContent {
  const title = baseTitle(raw);
  const text = toStringField(raw.data.text);

  return {
    id: toContentId("afirmasi", raw.slug),
    slug: raw.slug,
    type: "afirmasi",
    title,
    category: toStringField(raw.data.category, "umum"),
    tags: toStringArray(raw.data.tags),
    // Untuk afirmasi, excerpt yang paling wajar adalah kalimat afirmasinya
    // sendiri — bukan turunan dari body penjelasan tambahan.
    excerpt: toOptionalStringField(raw.data.excerpt) ?? text,
    publishedAt: toDateField(raw.data.publishedAt),
    featured: toBooleanField(raw.data.featured),
    coverEmoji: toStringField(raw.data.coverEmoji, "🌷"),
    content: raw.body,
    text,
  };
}

export function normalizeArtikel(raw: RawContentFile): ArtikelContent {
  const title = baseTitle(raw);

  return {
    id: toContentId("artikel", raw.slug),
    slug: raw.slug,
    type: "artikel",
    title,
    category: toStringField(raw.data.category, "parenting"),
    tags: toStringArray(raw.data.tags),
    excerpt: baseExcerpt(raw, title),
    publishedAt: toDateField(raw.data.publishedAt),
    featured: toBooleanField(raw.data.featured),
    coverEmoji: toStringField(raw.data.coverEmoji, "📖"),
    content: raw.body,
    author: toStringField(raw.data.author, "Tim Hadiah dari Langit"),
    readingTimeMinutes: estimateReadingTime(raw.body),
  };
}
