import { readingHistoryRepository } from "../repository/reading-history.repository";
import { nowIso } from "../utils/id";
import type { ReadableContentType, ReadingHistoryRecord, ReadingPosition } from "../models";

/** Di atas ambang ini, konten dianggap "selesai" dan lepas dari daftar "Lanjutkan Membaca". */
const COMPLETED_THRESHOLD = 96;

const DEFAULT_POSITION: ReadingPosition = { scrollY: 0, anchorId: null };

function makeId(type: ReadableContentType, slug: string): string {
  return `${type}:${slug}`;
}

function clampProgress(rawProgress: number): number {
  return Math.min(100, Math.max(0, Math.round(rawProgress)));
}

/**
 * Layer bisnis "Continue Reading" — reusable untuk SEMUA jenis konten
 * (doa, dzikir, afirmasi, artikel), bukan cuma artikel Perpustakaan.
 * Dipakai langsung (belum ada UI, lihat catatan di bawah), kontraknya:
 *
 * ```ts
 * import { readingHistoryService } from "@/lib/db";
 *
 * // Simpan posisi scroll terakhir (dipanggil dari scroll handler, throttled)
 * await readingHistoryService.savePosition("artikel", slug, { scrollY: 840, anchorId: "section-2" });
 *
 * // Simpan progres (%) — independen dari posisi, bisa dipanggil terpisah
 * await readingHistoryService.saveProgress("artikel", slug, 42);
 *
 * // Kombinasi keduanya sekaligus (satu write IndexedDB, dipakai kebanyakan kasus nyata)
 * await readingHistoryService.saveReadingState("artikel", slug, {
 *   position: { scrollY: 840, anchorId: "section-2" },
 *   progress: 42,
 * });
 *
 * // "Lanjutkan Membaca dari Posisi Terakhir"
 * const resume = await readingHistoryService.getResumePoint("artikel", slug);
 * if (resume) {
 *   window.scrollTo({ top: resume.position.scrollY });
 * }
 * ```
 */
export const readingHistoryService = {
  /** Satu entri, by jenis konten + slug. */
  async getEntry(type: ReadableContentType, slug: string): Promise<ReadingHistoryRecord | undefined> {
    return readingHistoryRepository.getById(makeId(type, slug));
  },

  async listAll(): Promise<ReadingHistoryRecord[]> {
    return readingHistoryRepository.getAll();
  },

  /** Seluruh entri untuk satu jenis konten saja, mis. hanya progres baca artikel. */
  async listByType(type: ReadableContentType): Promise<ReadingHistoryRecord[]> {
    return readingHistoryRepository.findByType(type);
  },

  /** Untuk section "Lanjutkan Membaca": sudah dimulai, belum selesai, terbaru dulu. */
  async listInProgress(type?: ReadableContentType): Promise<ReadingHistoryRecord[]> {
    const all = type ? await readingHistoryService.listByType(type) : await readingHistoryService.listAll();
    return all
      .filter((entry) => entry.progress > 0 && !entry.completed)
      .sort((a, b) => b.lastReadAt.localeCompare(a.lastReadAt));
  },

  async listCompleted(type?: ReadableContentType): Promise<ReadingHistoryRecord[]> {
    const all = type ? await readingHistoryService.listByType(type) : await readingHistoryService.listAll();
    return all.filter((entry) => entry.completed).sort((a, b) => b.lastReadAt.localeCompare(a.lastReadAt));
  },

  /**
   * Simpan/perbarui POSISI baca terakhir saja (progres yang sudah
   * tersimpan sebelumnya, kalau ada, tetap dipertahankan apa adanya).
   * Cocok dipanggil dari scroll handler yang di-throttle, lepas dari
   * kapan progres persentase dihitung ulang.
   */
  async savePosition(
    type: ReadableContentType,
    slug: string,
    position: ReadingPosition
  ): Promise<ReadingHistoryRecord> {
    const existing = await readingHistoryService.getEntry(type, slug);
    const now = nowIso();

    const record: ReadingHistoryRecord = {
      id: makeId(type, slug),
      type,
      slug,
      position,
      progress: existing?.progress ?? 0,
      completed: existing?.completed ?? false,
      startedAt: existing?.startedAt ?? now,
      lastReadAt: now,
    };

    await readingHistoryRepository.put(record);
    return record;
  },

  /**
   * Simpan/perbarui PROGRES (%) saja (posisi yang sudah tersimpan
   * sebelumnya, kalau ada, tetap dipertahankan apa adanya). `completed`
   * dihitung otomatis dari `COMPLETED_THRESHOLD`.
   */
  async saveProgress(
    type: ReadableContentType,
    slug: string,
    rawProgress: number
  ): Promise<ReadingHistoryRecord> {
    const existing = await readingHistoryService.getEntry(type, slug);
    const now = nowIso();
    const progress = clampProgress(rawProgress);

    const record: ReadingHistoryRecord = {
      id: makeId(type, slug),
      type,
      slug,
      position: existing?.position ?? DEFAULT_POSITION,
      progress,
      completed: progress >= COMPLETED_THRESHOLD,
      startedAt: existing?.startedAt ?? now,
      lastReadAt: now,
    };

    await readingHistoryRepository.put(record);
    return record;
  },

  /**
   * Simpan posisi + progres SEKALIGUS dalam satu write IndexedDB — dipakai
   * kebanyakan kasus nyata (mis. scroll handler yang menghitung keduanya
   * bersamaan), lebih efisien daripada memanggil `savePosition` lalu
   * `saveProgress` terpisah (yang berarti dua kali baca + tulis).
   */
  async saveReadingState(
    type: ReadableContentType,
    slug: string,
    state: { position: ReadingPosition; progress: number }
  ): Promise<ReadingHistoryRecord> {
    const existing = await readingHistoryService.getEntry(type, slug);
    const now = nowIso();
    const progress = clampProgress(state.progress);

    const record: ReadingHistoryRecord = {
      id: makeId(type, slug),
      type,
      slug,
      position: state.position,
      progress,
      completed: progress >= COMPLETED_THRESHOLD,
      startedAt: existing?.startedAt ?? now,
      lastReadAt: now,
    };

    await readingHistoryRepository.put(record);
    return record;
  },

  /**
   * "Lanjutkan Membaca dari Posisi Terakhir" — ambil posisi & progres
   * tersimpan untuk satu konten, atau `null` bila belum pernah dibaca
   * sama sekali. Konsumen (nanti UI) tinggal `scrollTo`/navigasi ke
   * `position` yang dikembalikan.
   */
  async getResumePoint(
    type: ReadableContentType,
    slug: string
  ): Promise<{ position: ReadingPosition; progress: number; completed: boolean } | null> {
    const entry = await readingHistoryService.getEntry(type, slug);
    if (!entry) return null;
    return { position: entry.position, progress: entry.progress, completed: entry.completed };
  },

  async remove(type: ReadableContentType, slug: string): Promise<void> {
    await readingHistoryRepository.delete(makeId(type, slug));
  },

  async clearAll(): Promise<void> {
    await readingHistoryRepository.clear();
  },
};
