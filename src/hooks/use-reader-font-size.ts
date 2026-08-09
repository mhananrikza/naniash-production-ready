"use client";

import * as React from "react";

import { isIndexedDbSupported, settingsService } from "@/lib/db";

const SETTINGS_KEY = "reader:fontSize";

/** Tiga tingkat ukuran — cukup untuk kontrol A− | A | A+ tanpa bikin bingung. */
export type ReaderFontSize = "sm" | "md" | "lg";

const ORDER: ReaderFontSize[] = ["sm", "md", "lg"];
const DEFAULT_SIZE: ReaderFontSize = "md";

/**
 * Preferensi ukuran font halaman Reader (`/content/[slug]`), disimpan di
 * IndexedDB lewat `settingsService` (store `settings`) — BUKAN localStorage
 * dan BUKAN store baru — supaya konsisten dengan preferensi lain (tema,
 * status onboarding) dan tetap dalam satu database lokal yang sama.
 * Berlaku global untuk seluruh materi (doa/dzikir/afirmasi/artikel), bukan
 * per-konten, sesuai kebiasaan pembaca yang biasanya punya satu ukuran
 * nyaman untuk semua bacaan.
 */
export function useReaderFontSize() {
  const [size, setSize] = React.useState<ReaderFontSize>(DEFAULT_SIZE);
  const [hydrated, setHydrated] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;

    if (!isIndexedDbSupported()) {
      setHydrated(true);
      return;
    }

    settingsService.get<ReaderFontSize>(SETTINGS_KEY, DEFAULT_SIZE).then((value) => {
      if (!cancelled) {
        setSize(ORDER.includes(value) ? value : DEFAULT_SIZE);
        setHydrated(true);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const persist = React.useCallback(async (next: ReaderFontSize) => {
    setSize(next);
    if (!isIndexedDbSupported()) return;
    try {
      await settingsService.set(SETTINGS_KEY, next);
    } catch {
      // Preferensi tampilan saja — kegagalan simpan tidak perlu mengganggu baca.
    }
  }, []);

  /** Set langsung ke satu level tertentu (mis. dari picker A−|A|A+ di Settings) — beda dari `increase`/`decrease` yang cuma naik/turun satu tingkat. */
  const setLevel = React.useCallback(
    (next: ReaderFontSize) => {
      persist(next);
    },
    [persist]
  );

  const increase = React.useCallback(() => {
    const nextIndex = Math.min(ORDER.length - 1, ORDER.indexOf(size) + 1);
    persist(ORDER[nextIndex] ?? size);
  }, [size, persist]);

  const decrease = React.useCallback(() => {
    const nextIndex = Math.max(0, ORDER.indexOf(size) - 1);
    persist(ORDER[nextIndex] ?? size);
  }, [size, persist]);

  return {
    size,
    hydrated,
    increase,
    decrease,
    setLevel,
    canIncrease: ORDER.indexOf(size) < ORDER.length - 1,
    canDecrease: ORDER.indexOf(size) > 0,
  };
}
