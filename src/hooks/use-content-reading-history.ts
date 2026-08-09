"use client";

import * as React from "react";

import { isIndexedDbSupported, readingHistoryService } from "@/lib/db";
import type { ReadableContentType, ReadingPosition } from "@/lib/db/models";

const SAVE_THROTTLE_MS = 1200;

/**
 * "Continue Reading" untuk halaman Reader (`/content/[slug]`) — pakai
 * `readingHistoryService` yang SUDAH DIBUAT (store `readingHistory` di
 * IndexedDB), bukan store/hook baru. Hook ini hanya menyambungkan scroll
 * di layar ke service tsb:
 *
 * - saat mount: baca posisi & progres tersimpan (untuk restore scroll bila
 *   pengguna kembali ke konten yang sama), lalu tandai `startedAt`.
 * - saat scroll: hitung progres dari tinggi elemen konten, simpan posisi +
 *   progres sekaligus (throttled) lewat `saveReadingState`.
 *
 * Kartu "Lanjutkan Membaca" di Home/Library nantinya tinggal baca store
 * yang sama lewat `readingHistoryService.listInProgress()` — tidak ada
 * sumber data baru yang perlu disinkronkan.
 */
export function useContentReadingHistory(type: ReadableContentType, slug: string) {
  const contentRef = React.useRef<HTMLDivElement>(null);
  const [progress, setProgress] = React.useState(0);
  const [resumed, setResumed] = React.useState(false);
  const lastSavedAtRef = React.useRef(0);
  const pendingRef = React.useRef<number | null>(null);

  // Restore posisi terakhir sekali saat halaman dibuka.
  React.useEffect(() => {
    let cancelled = false;
    if (!isIndexedDbSupported()) return;

    readingHistoryService.getResumePoint(type, slug).then((resume) => {
      if (cancelled || !resume) return;
      setProgress(resume.progress);
      if (resume.position.scrollY > 80 && resume.progress < 96) {
        window.scrollTo({ top: resume.position.scrollY, behavior: "auto" });
      }
      setResumed(true);
    });

    return () => {
      cancelled = true;
    };
  }, [type, slug]);

  const persist = React.useCallback(
    (percentage: number, position: ReadingPosition) => {
      if (!isIndexedDbSupported()) return;
      readingHistoryService.saveReadingState(type, slug, { position, progress: percentage }).catch(() => {
        // Progres baca bersifat pelengkap — kegagalan simpan tidak menghentikan pengalaman baca.
      });
    },
    [type, slug]
  );

  React.useEffect(() => {
    function handleScroll() {
      const node = contentRef.current;
      if (!node) return;

      const rect = node.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const total = rect.height - viewportHeight * 0.5;
      const scrolled = viewportHeight * 0.5 - rect.top;
      const percentage = total <= 0 ? 100 : (scrolled / total) * 100;
      const clamped = Math.min(100, Math.max(0, Math.round(percentage)));

      setProgress(clamped);

      const now = Date.now();
      const position: ReadingPosition = { scrollY: window.scrollY, anchorId: null };

      if (now - lastSavedAtRef.current >= SAVE_THROTTLE_MS) {
        lastSavedAtRef.current = now;
        persist(clamped, position);
        if (pendingRef.current) {
          window.clearTimeout(pendingRef.current);
          pendingRef.current = null;
        }
      } else if (!pendingRef.current) {
        pendingRef.current = window.setTimeout(() => {
          lastSavedAtRef.current = Date.now();
          pendingRef.current = null;
          persist(clamped, { scrollY: window.scrollY, anchorId: null });
        }, SAVE_THROTTLE_MS);
      }
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      if (pendingRef.current) window.clearTimeout(pendingRef.current);
    };
  }, [persist]);

  return { contentRef, progress, resumed };
}
