const WORDS_PER_MINUTE = 200;

/**
 * Estimasi waktu baca dari teks Markdown mentah (body, tanpa frontmatter).
 * Dipakai terutama untuk `artikel`; jenis konten lain (doa/dzikir/afirmasi)
 * umumnya pendek sehingga tidak menampilkan estimasi ini di UI, tapi
 * fungsinya tetap generik agar reusable.
 */
export function estimateReadingTime(
  markdown: string,
  wordsPerMinute: number = WORDS_PER_MINUTE
): number {
  const wordCount = markdown.trim().split(/\s+/).filter(Boolean).length;
  if (wordCount === 0) return 1;
  return Math.max(1, Math.round(wordCount / wordsPerMinute));
}
