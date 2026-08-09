/**
 * Tipe domain untuk Daily Journey Engine — pemilihan otomatis 1 doa, 1
 * dzikir, 1 afirmasi, dan 1 artikel setiap hari.
 *
 * Terpisah dari `@/types/content` (definisi konten Markdown itu sendiri)
 * karena file ini mendeskripsikan *pemilihan harian* atas konten tsb —
 * siklus hidupnya beda: konten statis dari `/content`, pemilihan harian
 * berubah tiap hari dan progresnya tersimpan di IndexedDB.
 */

/** Satu slot = satu jenis materi yang dipilihkan tiap hari. Urutan di sini dipakai di banyak tempat sebagai urutan iterasi baku. */
export type DailyJourneySlot = "doa" | "dzikir" | "afirmasi" | "artikel";

export const DAILY_JOURNEY_SLOTS: readonly DailyJourneySlot[] = [
  "doa",
  "dzikir",
  "afirmasi",
  "artikel",
];

/** Kumpulan id konten (bukan objek penuh) per slot — cukup untuk dihitung index-nya oleh algoritma. */
export type DailyJourneyPools = Record<DailyJourneySlot, string[]>;

/** Hasil resolusi satu hari: id konten (`${type}:${slug}`) yang terpilih per slot. */
export type DailyJourneySelectionIds = Record<DailyJourneySlot, string>;

/** Status selesai/belum per slot untuk satu hari. */
export type DailyJourneyCompletion = Record<DailyJourneySlot, boolean>;

/**
 * Satu entri di manifest statis `public/daily-journey-pool.json`
 * (dihasilkan `scripts/generate-daily-journey-pool.mjs`) — subset ringan
 * dari `ContentItemMeta`, cukup untuk menampilkan kartu/preview di client
 * tanpa perlu fetch server atau membaca `fs` (yang tidak tersedia di
 * browser). Body Markdown lengkap tetap diambil lewat Content Engine
 * (`getContentBySlug`) hanya saat pengguna benar-benar membuka materinya.
 */
export interface DailyJourneyPoolItem {
  /** Sama dengan `ContentItem.id` di Content Engine: `${type}:${slug}`. */
  id: string;
  slug: string;
  type: DailyJourneySlot;
  title: string;
  category: string;
  coverEmoji: string;
  excerpt: string;
}

export interface DailyJourneyPoolManifest {
  /** Hash isi seluruh item — dipakai sebagai `revision` precache & untuk deteksi konten berubah. */
  version: string;
  generatedAt: string;
  items: DailyJourneyPoolItem[];
}

/** Bentuk siap pakai untuk konsumen (hook/UI nanti): id sudah dicocokkan jadi item manifest penuh. */
export interface DailyJourneyDay {
  /** Tanggal, format `YYYY-MM-DD`. */
  date: string;
  items: Record<DailyJourneySlot, DailyJourneyPoolItem>;
  completion: DailyJourneyCompletion;
  /** `true` bila keempat slot sudah ditandai selesai. */
  isCompleted: boolean;
  generatedAt: string;
  completedAt: string | null;
}
