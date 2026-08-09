/**
 * Tokenizer bersama untuk Search Engine lokal. Dipakai di DUA tempat yang
 * hasilnya wajib konsisten:
 *
 * 1. `search-index.service.ts` — saat membangun inverted index dari
 *    `search-data.json` (tokenize isi dokumen).
 * 2. `search-query.service.ts` — saat men-tokenize query pengguna sebelum
 *    di-lookup ke inverted index.
 *
 * Kalau keduanya memakai aturan normalisasi yang berbeda (mis. salah satu
 * tidak membuang diakritik), token hasil query tidak akan pernah cocok
 * dengan token di index — makanya logikanya disatukan di sini, bukan
 * diduplikasi.
 */

/**
 * Daftar kata tugas Bahasa Indonesia yang sangat umum & nyaris tidak
 * pernah jadi maksud pencarian (mis. tidak ada orang mencari kata "yang"
 * saja). Sengaja pendek & konservatif — kata domain seperti "doa", "anak",
 * "hati" TIDAK masuk sini walau pendek, karena itu justru istilah yang mau
 * dicari orang.
 */
const STOPWORDS = new Set([
  "yang", "dan", "di", "ke", "dari", "untuk", "dengan", "ini", "itu",
  "atau", "pada", "dalam", "akan", "adalah", "juga", "tidak", "saja",
  "agar", "karena", "oleh", "para", "secara", "atas", "bagi", "sudah",
  "belum", "saat", "jika", "maka", "tersebut", "sebuah", "sebagai",
  "sang", "si", "ya", "ada", "bisa", "kita", "kami", "nya",
]);

/** Panjang token minimum yang diindeks — token 1 huruf hampir tidak informatif dan membengkakkan index. */
const MIN_TOKEN_LENGTH = 2;

/**
 * Normalisasi teks: lowercase, buang diakritik (mis. "café" -> "cafe"
 * lewat dekomposisi NFKD lalu buang combining marks), lalu rapikan spasi.
 * TIDAK memecah jadi token — dipakai juga sendirian oleh
 * `search.ts` (scoring Content Engine server-side) sehingga perilakunya
 * dipertahankan sama di sini.
 */
export function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "") // combining diacritical marks
    .trim();
}

/**
 * Pecah teks jadi array token siap-index/siap-query: lowercase, tanpa
 * diakritik, tanda baca dibuang, token < `MIN_TOKEN_LENGTH` huruf dan
 * stopword dibuang. Urutan token tidak dipertahankan secara khusus (tidak
 * dibutuhkan — index berbasis bag-of-words per field, bukan frasa).
 */
export function tokenize(value: string): string[] {
  const normalized = normalizeText(value);
  const rawTokens = normalized.split(/[^\p{L}\p{N}]+/u).filter(Boolean);

  return rawTokens.filter(
    (token) => token.length >= MIN_TOKEN_LENGTH && !STOPWORDS.has(token)
  );
}

/** Hitung frekuensi tiap token dalam satu teks — dipakai untuk skor `tf` (term frequency) per field per dokumen. */
export function countTermFrequencies(tokens: string[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const token of tokens) {
    counts.set(token, (counts.get(token) ?? 0) + 1);
  }
  return counts;
}

/**
 * Bobot relevansi per field. Dipakai baik saat membangun index (tidak
 * perlu, hanya scoring) maupun saat scoring hasil query — nilai lebih
 * tinggi berarti kecocokan di field itu lebih "berarti". Selaras dengan
 * bobot yang sudah dipakai `src/utils/content/search.ts` di server
 * (title=5, tags=3~4, category=2) supaya urutan hasil terasa konsisten
 * antara pencarian server-side lama dan Search Engine offline yang baru.
 */
export const FIELD_WEIGHTS: Record<"title" | "content" | "category" | "tags", number> = {
  title: 5,
  tags: 4,
  category: 2,
  content: 1,
};
