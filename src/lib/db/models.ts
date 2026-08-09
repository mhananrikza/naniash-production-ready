/**
 * Model data untuk tiap object store di database lokal (IndexedDB).
 *
 * Terpisah dari `@/types` (skema domain yang mengikuti Supabase Phase 1) —
 * model di sini murni untuk kebutuhan penyimpanan on-device (favorit,
 * jurnal, progres harian, dsb.) yang siklus hidupnya beda dari data server.
 */

// ---------------------------------------------------------------------------
// favorites — item yang ditandai favorit lintas domain (artikel, doa, dst.)
// ---------------------------------------------------------------------------

export type FavoriteType = "article" | "doa" | "dzikir" | "afirmasi" | "tirakat";

export interface FavoriteRecord {
  /** Kunci komposit `${type}:${refId}`, dibuat di `favorites.service.ts`. */
  id: string;
  type: FavoriteType;
  /** Id/slug entitas asli, mis. slug artikel atau id doa. */
  refId: string;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// journal — entri jurnal refleksi harian
// ---------------------------------------------------------------------------

export interface JournalRecord {
  id: string;
  /** Tanggal pencatatan, format `YYYY-MM-DD`. */
  date: string;
  mood: string | null;
  moodEmoji: string | null;
  content: string;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// progress — checklist aktivitas harian (doa pagi, tirakat, afirmasi, dst.)
// ---------------------------------------------------------------------------

export interface DailyProgressItemState {
  done: boolean;
  updatedAt: string;
}

export interface DailyProgressRecord {
  /** Tanggal, format `YYYY-MM-DD` — sekaligus id record. */
  id: string;
  /** Map itemId (mis. "doa-pagi") -> status. */
  items: Record<string, DailyProgressItemState>;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// challenge — partisipasi & check-in harian pada sebuah challenge
// ---------------------------------------------------------------------------

export interface ChallengeRecord {
  /** Id/slug challenge, mis. "30-hari-doa-konsisten". */
  id: string;
  title: string;
  totalDays: number;
  startedAt: string;
  /** Map tanggal (`YYYY-MM-DD`) -> selesai/tidak. */
  checkIns: Record<string, boolean>;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// settings — preferensi aplikasi, key-value generik
// ---------------------------------------------------------------------------

export interface SettingsRecord<T = unknown> {
  key: string;
  value: T;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// reminder — pengingat terjadwal (doa, tirakat, jurnal, custom)
// ---------------------------------------------------------------------------

export type ReminderType = "doa" | "tirakat" | "jurnal" | "custom";

export interface ReminderRecord {
  id: string;
  type: ReminderType;
  title: string;
  /** Jam pengingat, format 24 jam "HH:mm". */
  time: string;
  /** Hari aktif, 0 = Minggu … 6 = Sabtu. */
  days: number[];
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// reminderSchedule — jadwal berikutnya untuk Reminder Engine (lihat
// `src/services/reminder-engine/` untuk algoritma & orkestrasi, dan
// `src/lib/db/services/reminder-engine.service.ts` untuk logika baca/tulisnya).
//
// Terpisah dari `ReminderRecord` di atas — `ReminderRecord` adalah daftar
// pengingat generik (bisa banyak, tipe bebas, dibuat pengguna lewat CRUD),
// sedangkan store ini KHUSUS untuk 2 pengingat bawaan Reminder Engine
// ("doa" pagi & "journal" malam) beserta jam berikutnya ia akan berbunyi.
// Sengaja dipisah supaya jadwal tetap tersimpan & bisa dibaca ulang walau
// browser tidak mendukung Notification API sama sekali.
// ---------------------------------------------------------------------------

export type ReminderEngineKind = "doa" | "journal";

export interface ReminderScheduleRecord {
  /** Sekaligus id record — satu record per jenis ("doa" | "journal"). */
  id: ReminderEngineKind;
  enabled: boolean;
  /** Jam "HH:mm" yang dipakai untuk menghitung `nextFireAt` ini. */
  time: string;
  /** Kapan reminder ini berikutnya akan berbunyi, ISO string — `null` bila nonaktif. */
  nextFireAt: string | null;
  /** Kapan reminder ini terakhir kali benar-benar terpicu, ISO string atau `null` bila belum pernah. */
  lastFiredAt: string | null;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// readingHistory — "Continue Reading": posisi & progres baca per konten
// ---------------------------------------------------------------------------

/**
 * Jenis konten yang progres bacanya bisa dilacak. Sama dengan `ContentType`
 * di Content Engine (`@/types/content`) — didefinisikan ulang sebagai
 * literal union di sini (bukan import) supaya `models.ts` tetap tidak
 * bergantung pada layer lain, konsisten dengan pola file ini.
 */
export type ReadableContentType = "doa" | "dzikir" | "afirmasi" | "artikel";

/**
 * Posisi baca terakhir — cukup detail untuk mengembalikan pengguna ke
 * tempat persis ia berhenti, dipisah dari `progress` (persentase) karena
 * keduanya punya kegunaan beda: `position` untuk RESTORE tampilan,
 * `progress` untuk DITAMPILKAN (progress bar, badge "80% selesai", dst).
 */
export interface ReadingPosition {
  /** Offset scroll dari atas konten, dalam piksel. */
  scrollY: number;
  /**
   * Opsional: id elemen/heading terakhir terlihat (mis. "section-3").
   * Cadangan saat `scrollY` piksel tidak lagi akurat (mis. dibuka lagi di
   * perangkat dengan lebar layar/ukuran font berbeda) — konsumen boleh
   * scroll-ke-elemen ini dulu, baru sesuaikan halus dengan `scrollY`.
   */
  anchorId: string | null;
}

export interface ReadingHistoryRecord {
  /** Kunci komposit `${type}:${slug}` — pola sama seperti `FavoriteRecord.id`, dibuat di `reading-history.service.ts`. */
  id: string;
  type: ReadableContentType;
  /** Slug/id entitas asli di dalam jenisnya (bukan gabungan dengan type). */
  slug: string;
  /** Posisi baca terakhir — untuk "Lanjutkan Membaca dari Posisi Terakhir". */
  position: ReadingPosition;
  /** Persentase 0–100. */
  progress: number;
  completed: boolean;
  /** Pertama kali mulai membaca konten ini. */
  startedAt: string;
  /** Terakhir kali posisi/progres diperbarui. */
  lastReadAt: string;
}

// ---------------------------------------------------------------------------
// dailyJourney — pemilihan otomatis 1 doa/dzikir/afirmasi/artikel per hari
// (lihat `src/services/daily-journey/` untuk algoritma pemilihannya dan
// `src/lib/db/services/daily-journey.service.ts` untuk logika penyimpanan).
// ---------------------------------------------------------------------------

/**
 * Didefinisikan ulang sebagai literal union (bukan import dari
 * `@/types/daily-journey`), konsisten dengan pola `ReadableContentType` di
 * atas — `models.ts` sengaja tidak bergantung pada layer lain.
 */
export type DailyJourneySlotName = "doa" | "dzikir" | "afirmasi" | "artikel";

export interface DailyJourneyRecord {
  /** Tanggal, format `YYYY-MM-DD` — sekaligus id record (pola sama dengan `DailyProgressRecord`). */
  id: string;
  /** Id konten (`${type}:${slug}`, sama seperti `ContentItem.id`) yang terpilih untuk tiap slot hari ini. */
  itemIds: Record<DailyJourneySlotName, string>;
  /** Status selesai/belum per slot. Materi TIDAK berubah saat ditandai selesai — hanya status ini yang berubah. */
  completion: Record<DailyJourneySlotName, boolean>;
  /** Kapan materi hari ini pertama kali digenerate (bukan setiap kali dibuka ulang). */
  generatedAt: string;
  /** Kapan keempat slot selesai ditandai sekaligus — `null` selama masih ada yang belum, otomatis kosong lagi bila salah satu di-uncheck. */
  completedAt: string | null;
}

// ---------------------------------------------------------------------------
// Search Engine — lihat `src/lib/db/services/search/` untuk logika bisnis
// & penjelasan strategi indexing (inverted index + prefix range query).
// ---------------------------------------------------------------------------

/** Field yang bisa jadi target pencarian: judul, isi, kategori, atau tag. */
export type SearchField = "title" | "content" | "category" | "tags";

export interface SearchDocumentRecord {
  /** Sama dengan `ContentItem.id` (`${type}:${slug}`) dari Content Engine. */
  id: string;
  slug: string;
  type: "doa" | "dzikir" | "afirmasi" | "artikel";
  title: string;
  category: string;
  tags: string[];
  excerpt: string;
}

/** Satu entri posting list: dokumen mana + di field apa + seberapa sering token itu muncul. */
export interface SearchPosting {
  id: string;
  field: SearchField;
  /** Term frequency — jumlah kemunculan token ini di field tsb pada dokumen ini. */
  tf: number;
}

export interface SearchTermRecord {
  /** Token ternormalisasi (lowercase, tanpa diakritik) — sekaligus primary key. */
  term: string;
  postings: SearchPosting[];
  /** Document frequency — jumlah dokumen unik yang mengandung token ini, untuk skor idf. */
  df: number;
}

export interface SearchHistoryRecord {
  id: string;
  /** Query asli seperti diketik pengguna, untuk ditampilkan di "Recent Search". */
  query: string;
  /** Query setelah dinormalisasi (lowercase, trim spasi) — kunci pengelompokan. */
  normalizedQuery: string;
  resultCount: number;
  createdAt: string;
}

export interface SearchStatRecord {
  /** Query ternormalisasi — sekaligus primary key, satu record per query unik. */
  query: string;
  /** Query asli terakhir kali dicari (biar tampilannya tidak selalu huruf kecil). */
  displayQuery: string;
  count: number;
  lastUsedAt: string;
}

// ---------------------------------------------------------------------------
// chatHistory — riwayat percakapan Naniash AI, tersimpan lokal saja (lihat
// `src/services/ai/`). TIDAK PERNAH dikirim ke server mana pun — store ini
// murni untuk pengalaman "lanjutkan percakapan" di perangkat yang sama.
// ---------------------------------------------------------------------------

export type ChatMessageRole = "user" | "assistant";

export interface ChatMessageRecord {
  id: string;
  /** Mengelompokkan pesan dalam satu sesi percakapan (satu sesi = sejak "Clear conversation" terakhir). */
  sessionId: string;
  role: ChatMessageRole;
  content: string;
  /** Provider yang menjawab (mis. "gemini" atau "offline-search") — kosong untuk pesan role "user". */
  providerId?: string;
  /** Mode saat pesan ini dijawab — dipakai untuk menampilkan lencana Online/Offline pada bubble lama. */
  mode?: "online" | "offline";
  createdAt: string;
}
