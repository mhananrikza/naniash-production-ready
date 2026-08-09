/**
 * Tipe domain untuk Content Engine — sumber data dari file Markdown di
 * `content/{doa,dzikir,afirmasi,artikel}/*.md`. Terpisah dari
 * `@/types/index.ts` (skema Supabase/IndexedDB) karena siklus hidup dan
 * sumbernya berbeda: konten di sini murni statis, dibaca dari disk lewat
 * `@/services/content`, tidak pernah lewat API/network.
 */

/** Empat kategori materi yang didukung, sesuai sub-folder di `/content`. */
export type ContentType = "doa" | "dzikir" | "afirmasi" | "artikel";

export const CONTENT_TYPES: readonly ContentType[] = [
  "doa",
  "dzikir",
  "afirmasi",
  "artikel",
];

/**
 * Field yang dimiliki semua jenis konten. `category` di sini adalah
 * kategori tematik per jenis (mis. "anak-laki-laki" untuk doa, "kehamilan"
 * untuk artikel) — bukan `type`, yang membedakan folder/domainnya.
 */
export interface ContentBase {
  /** Kunci komposit unik lintas jenis konten: `${type}:${slug}`. */
  id: string;
  /** Diturunkan dari nama file, mis. `doa-anak-laki-laki-jadi-pemimpin`. */
  slug: string;
  type: ContentType;
  title: string;
  category: string;
  tags: string[];
  excerpt: string;
  /** ISO date string, mis. "2026-07-28". */
  publishedAt: string;
  /** Ditandai lewat frontmatter `featured: true`; default `false`. */
  featured: boolean;
  coverEmoji: string;
  /** Body Markdown, frontmatter sudah dilepas. Kosong untuk hasil *Meta*. */
  content: string;
}

export interface DoaContent extends ContentBase {
  type: "doa";
  arabicText: string;
  latinText: string;
  translationId: string;
  /** Referensi dalil (ayat/hadits), opsional. */
  dalil?: string;
  /** Situasi yang cocok untuk membaca doa ini, mis. "Anak tantrum". */
  context: string[];
}

export interface DzikirContent extends ContentBase {
  type: "dzikir";
  arabicText: string;
  latinText: string;
  translationId: string;
  /** Jumlah anjuran pengulangan, mis. 33 untuk tasbih. */
  repeatCount?: number;
  context: string[];
}

export interface AfirmasiContent extends ContentBase {
  type: "afirmasi";
  /** Kalimat afirmasi utama — biasanya sama dengan ringkasan `excerpt`. */
  text: string;
}

export interface ArtikelContent extends ContentBase {
  type: "artikel";
  author: string;
  readingTimeMinutes: number;
}

/** Union diskriminatif — gunakan `item.type` untuk narrowing. */
export type ContentItem = DoaContent | DzikirContent | AfirmasiContent | ArtikelContent;

/**
 * `Omit` bawaan TypeScript tidak distributif atas union, sehingga
 * `Omit<ContentItem, "content">` akan runtuh jadi satu bentuk gabungan dan
 * kehilangan diskriminasi per-tipe. Helper ini menjaga union tetap utuh.
 */
type DistributiveOmit<T, K extends keyof T> = T extends unknown ? Omit<T, K> : never;

/**
 * Versi ringan tanpa body Markdown — dipakai di halaman daftar/kartu agar
 * payload tetap kecil. Body lengkap baru diambil lewat `getContentBySlug`.
 */
export type ContentItemMeta = DistributiveOmit<ContentItem, "content">;

// ---------------------------------------------------------------------------
// Opsi query untuk fungsi-fungsi Content Engine.
// ---------------------------------------------------------------------------

export interface ContentQueryOptions {
  /** Batasi ke satu atau beberapa jenis konten. Default: semua jenis. */
  type?: ContentType | ContentType[];
  /** Batasi jumlah hasil. */
  limit?: number;
}

export interface SearchContentOptions extends ContentQueryOptions {
  /** Batasi ke kategori tematik tertentu (mis. "kehamilan"). */
  category?: string;
}

export interface ContentSearchResult {
  item: ContentItemMeta;
  /** Skor relevansi, semakin besar semakin cocok. Bukan persentase. */
  score: number;
  /** Field yang cocok dengan query, mis. ["title", "tags"] — untuk highlight UI. */
  matchedFields: string[];
}

// ---------------------------------------------------------------------------
// "Continue Reading" — Content Engine tidak menyimpan progres baca sendiri
// (tidak ada storage/API di layer ini). Progres dipasok oleh pemanggil,
// misalnya dari `useReadingProgress` (localStorage) atau tabel Supabase;
// engine hanya mencocokkan & mengurutkannya kembali ke bentuk `ContentItem`.
// ---------------------------------------------------------------------------

export interface ContentProgressEntry {
  /** Harus cocok dengan `ContentItem.id`, yaitu `${type}:${slug}`. */
  id: string;
  /** 0–100. */
  progress: number;
  /** ISO datetime kapan progres terakhir diperbarui. */
  updatedAt: string;
}

export interface ContinueReadingItem {
  item: ContentItemMeta;
  progress: number;
  updatedAt: string;
}
