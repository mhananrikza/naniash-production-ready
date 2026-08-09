"use client";

import * as React from "react";

import { useLocalStorage } from "@/hooks/use-local-storage";

const STORAGE_KEY = "hdl:library:reading-progress";
/** Di atas ambang ini, artikel dianggap "selesai" dan lepas dari Continue Reading. */
const COMPLETED_THRESHOLD = 96;

export interface ReadingProgressEntry {
  progress: number; // 0–100
  updatedAt: string; // ISO datetime
}

export type ReadingProgressMap = Record<string, ReadingProgressEntry>;

/**
 * Menyimpan progres baca per-slug artikel di localStorage, dipakai untuk
 * section "Lanjutkan Membaca" di halaman Perpustakaan dan progress bar di
 * halaman detail artikel.
 */
export function useReadingProgress() {
  const [progressMap, setProgressMap, hydrated] = useLocalStorage<ReadingProgressMap>(
    STORAGE_KEY,
    {}
  );

  const updateProgress = React.useCallback(
    (slug: string, rawProgress: number) => {
      const clamped = Math.min(100, Math.max(0, Math.round(rawProgress)));
      setProgressMap((prev) => {
        const existing = prev[slug];
        // Hindari write berlebihan saat scroll bila perubahan kecil.
        if (existing && Math.abs(existing.progress - clamped) < 2) return prev;
        return {
          ...prev,
          [slug]: { progress: clamped, updatedAt: new Date().toISOString() },
        };
      });
    },
    [setProgressMap]
  );

  const inProgressEntries = React.useMemo(
    () =>
      Object.entries(progressMap)
        .filter(([, entry]) => entry.progress > 0 && entry.progress < COMPLETED_THRESHOLD)
        .sort((a, b) => +new Date(b[1].updatedAt) - +new Date(a[1].updatedAt)),
    [progressMap]
  );

  return { progressMap, updateProgress, inProgressEntries, hydrated };
}
