"use client";

import * as React from "react";

import { useLocalStorage } from "@/hooks/use-local-storage";

const STORAGE_KEY = "hdl:library:favorites";

/**
 * Menyimpan daftar slug artikel favorit di localStorage. Phase 1 belum
 * tersambung Supabase, jadi favorit bersifat per-perangkat — cukup untuk
 * mendemokan interaksi, tinggal diganti sumbernya nanti tanpa mengubah
 * kontrak hook ini (`favorites`, `isFavorite`, `toggleFavorite`).
 */
export function useLibraryFavorites() {
  const [favorites, setFavorites, hydrated] = useLocalStorage<string[]>(STORAGE_KEY, []);

  const isFavorite = React.useCallback(
    (slug: string) => favorites.includes(slug),
    [favorites]
  );

  const toggleFavorite = React.useCallback(
    (slug: string) => {
      setFavorites((prev) =>
        prev.includes(slug) ? prev.filter((item) => item !== slug) : [...prev, slug]
      );
    },
    [setFavorites]
  );

  return { favorites, isFavorite, toggleFavorite, hydrated };
}
