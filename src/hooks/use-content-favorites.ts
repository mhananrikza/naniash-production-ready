"use client";

import * as React from "react";

import { isIndexedDbSupported, favoritesService, dbEvents } from "@/lib/db";
import type { FavoriteType } from "@/lib/db/models";
import type { ContentType } from "@/types/content";

/**
 * Sama seperti `toFavoriteType` di `useContentFavorite`: `FavoriteType`
 * memakai "article" (bukan "artikel") untuk penamaan store lama.
 */
function toFavoriteType(type: ContentType): FavoriteType {
  return type === "artikel" ? "article" : type;
}

function toKey(type: ContentType, slug: string): string {
  return `${toFavoriteType(type)}:${slug}`;
}

/**
 * Status & toggle favorit untuk BANYAK item konten sekaligus (grid/daftar) —
 * pasangan dari `useContentFavorite` (satu item, dipakai halaman Reader).
 * Dipakai `LibraryPageClient` dan `FavoritPageClient` supaya keduanya
 * membaca dari satu sumber yang sama: `favoritesService` (IndexedDB), bukan
 * `useLibraryFavorites` (localStorage, sudah tidak dipakai lagi).
 *
 * Dikunci dengan `${type}:${slug}` (bukan slug saja) supaya item dari jenis
 * konten berbeda tidak pernah tertukar status favoritnya walau kebetulan
 * punya slug yang sama.
 */
export function useContentFavorites() {
  const [favoriteKeys, setFavoriteKeys] = React.useState<Set<string>>(new Set());
  const [hydrated, setHydrated] = React.useState(false);

  const load = React.useCallback(async () => {
    if (!isIndexedDbSupported()) {
      setHydrated(true);
      return;
    }
    try {
      const records = await favoritesService.list();
      setFavoriteKeys(new Set(records.map((record) => `${record.type}:${record.refId}`)));
    } finally {
      setHydrated(true);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  // Ikut ter-update kalau status favorit diubah dari komponen lain (mis.
  // tombol hati di Reader atau kartu "Doa Hari Ini" di Home).
  React.useEffect(() => {
    return dbEvents.subscribe("favorites", load);
  }, [load]);

  const isFavorite = React.useCallback(
    (type: ContentType, slug: string) => favoriteKeys.has(toKey(type, slug)),
    [favoriteKeys]
  );

  const toggle = React.useCallback(async (type: ContentType, slug: string) => {
    const key = toKey(type, slug);
    // Optimistic — dibalik lagi kalau ternyata gagal, supaya interaksi terasa instan.
    setFavoriteKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
    try {
      await favoritesService.toggle(toFavoriteType(type), slug);
    } catch {
      setFavoriteKeys((prev) => {
        const next = new Set(prev);
        if (next.has(key)) {
          next.delete(key);
        } else {
          next.add(key);
        }
        return next;
      });
    }
  }, []);

  return { isFavorite, toggle, hydrated };
}
