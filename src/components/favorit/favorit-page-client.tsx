"use client";

import * as React from "react";
import { Heart } from "lucide-react";

import { Reveal } from "@/components/ui/reveal";
import { ArticleCard } from "@/components/library/article-card";
import { FavoritEmptyState } from "@/components/favorit/favorit-empty-state";
import { useContentFavorites } from "@/hooks/use-content-favorites";
import type { ContentItemMeta } from "@/types/content";

export interface FavoritPageClientProps {
  /** Seluruh item Content Engine (meta, tanpa body), dari `getAllContent()` di Server Component. */
  items: ContentItemMeta[];
}

/**
 * Halaman Favorit — menampilkan doa/dzikir/afirmasi/artikel yang benar-benar
 * sudah ditandai favorit lewat `useContentFavorites` (`favoritesService`/
 * IndexedDB) — hook BERSAMA yang sama dipakai `LibraryPageClient`, BUKAN
 * `useLibraryFavorites` (localStorage, sudah tidak dipakai lagi) dan bukan
 * sistem favorit baru. Kartu memakai `ArticleCard` yang sama dipakai
 * Perpustakaan supaya tautan ke Reader (artikel → `/library/[slug]`, jenis
 * lain → `/content/[slug]`) tetap konsisten tanpa logika baru.
 */
export function FavoritPageClient({ items }: FavoritPageClientProps) {
  const { isFavorite, toggle: toggleFavoriteItem, hydrated } = useContentFavorites();

  const favoriteItems = React.useMemo(
    () => items.filter((item) => isFavorite(item.type, item.slug)),
    [items, isFavorite]
  );

  function handleToggleFavorite(slug: string) {
    const item = favoriteItems.find((entry) => entry.slug === slug);
    if (item) toggleFavoriteItem(item.type, slug);
  }

  return (
    <div className="space-y-6 pb-4">
      <Reveal index={0}>
        <div className="relative flex items-center gap-4 overflow-hidden rounded-[1.75rem] bg-senja-100/50 px-5 py-5 sm:px-7 sm:py-6">
          <div
            className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-senja-300/30 blur-xl"
            aria-hidden
          />
          <span className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-senja-100 text-senja-700">
            <Heart className="h-6 w-6" strokeWidth={1.75} />
          </span>
          <div className="relative space-y-1">
            <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-senja-700">
              <Heart className="h-3.5 w-3.5" aria-hidden />
              Favorit
            </p>
            <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
              Materi Tersimpan
            </h1>
            <p className="text-sm text-muted-foreground">
              Doa, dzikir, afirmasi, dan artikel yang pernah Bunda tandai favorit.
            </p>
          </div>
        </div>
      </Reveal>

      <Reveal index={1}>
        {!hydrated ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-hidden>
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-48 animate-pulse rounded-2xl bg-muted" />
            ))}
          </div>
        ) : favoriteItems.length === 0 ? (
          <FavoritEmptyState />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {favoriteItems.map((item) => (
              <ArticleCard
                key={`${item.type}:${item.slug}`}
                article={item}
                isFavorite
                onToggleFavorite={handleToggleFavorite}
              />
            ))}
          </div>
        )}
      </Reveal>
    </div>
  );
}
