"use client";

import * as React from "react";

import { isIndexedDbSupported, favoritesService, dbEvents } from "@/lib/db";
import type { FavoriteType } from "@/lib/db/models";
import type { ContentType } from "@/types/content";

/**
 * `FavoriteType` ("article") sedikit beda penamaan dari `ContentType`
 * Content Engine ("artikel") — peninggalan penamaan store lama, bukan
 * bug. Dipetakan di sini sekali saja supaya pemanggil lain tidak perlu
 * tahu perbedaan ini.
 */
function toFavoriteType(type: ContentType): FavoriteType {
  return type === "artikel" ? "article" : type;
}

/**
 * Status & toggle favorit untuk SATU item konten di halaman Reader.
 * Menggunakan `favoritesService` (IndexedDB) yang sama dipakai `DoaHariIniCard`
 * — bukan hook `useLibraryFavorites` (localStorage) yang lama — supaya satu
 * item konten selalu punya satu status favorit yang konsisten di mana pun
 * ditampilkan (Home, Library, Reader).
 */
export function useContentFavorite(type: ContentType, slug: string) {
  const favoriteType = toFavoriteType(type);
  const [isFavorite, setIsFavorite] = React.useState(false);
  const [hydrated, setHydrated] = React.useState(false);

  const load = React.useCallback(async () => {
    if (!isIndexedDbSupported()) {
      setHydrated(true);
      return;
    }
    try {
      const value = await favoritesService.isFavorite(favoriteType, slug);
      setIsFavorite(value);
    } finally {
      setHydrated(true);
    }
  }, [favoriteType, slug]);

  React.useEffect(() => {
    load();
  }, [load]);

  // Ikut ter-update kalau status favorit item ini diubah dari komponen lain
  // (mis. ditandai favorit dulu dari kartu "Doa Hari Ini" di Home).
  React.useEffect(() => {
    return dbEvents.subscribe("favorites", load);
  }, [load]);

  const toggle = React.useCallback(async () => {
    setIsFavorite((prev) => !prev); // optimistic, dibalik lagi kalau gagal
    try {
      const next = await favoritesService.toggle(favoriteType, slug);
      setIsFavorite(next);
    } catch {
      setIsFavorite((prev) => !prev);
    }
  }, [favoriteType, slug]);

  return { isFavorite, toggle, hydrated };
}
