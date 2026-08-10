"use client";

import * as React from "react";
import { BookOpen } from "lucide-react";

import { Naniash } from "@/components/naniash/naniash";
import { Reveal } from "@/components/ui/reveal";
import { LibrarySearchBar } from "@/components/library/library-search-bar";
import { CategoryFilter, ALL_CATEGORY_SLUG } from "@/components/library/category-filter";
import { ArticleCard } from "@/components/library/article-card";
import {
  ContinueReadingSection,
  type ContinueReadingItem,
} from "@/components/library/continue-reading-section";
import { LatestArticlesSection } from "@/components/library/latest-articles-section";
import { LibraryEmptyState } from "@/components/library/library-empty-state";
import { useContentFavorites } from "@/hooks/use-content-favorites";
import { useReadingProgress } from "@/hooks/use-reading-progress";
import { scoreContentItem } from "@/utils/content";
import type { ContentItemMeta } from "@/types/content";

export interface LibraryPageClientProps {
  items: ContentItemMeta[];
}

const LATEST_COUNT = 6;
const CONTINUE_READING_COUNT = 6;

/**
 * Orkestrator interaktif halaman Perpustakaan: search, filter jenis
 * materi, favorit, "Lanjutkan Membaca", dan "Artikel Terbaru". Menerima
 * SELURUH jenis materi (doa, dzikir, afirmasi, artikel) sebagai props
 * dari Server Component `app/(app)/library/page.tsx` — data ini datang
 * dari Content Engine (`getAllContent()`), bukan lagi khusus artikel.
 * Komponen ini sendiri tidak menyentuh `fs`, hanya state UI. Status favorit
 * dibaca/ditulis lewat `useContentFavorites` (`favoritesService`/IndexedDB) —
 * SATU sumber kebenaran yang sama dipakai halaman Favorit dan Reader,
 * bukan lagi `useLibraryFavorites` (localStorage, khusus artikel & sudah
 * tidak dipakai lagi).
 *
 * Pencarian: `searchContent()` di Content Engine membaca `fs`, jadi
 * tidak bisa dipanggil langsung dari Client Component ini. Karena
 * seluruh item (tanpa body Markdown) sudah tersedia di memori lewat
 * props, pencarian di sini memakai `scoreContentItem` — fungsi scoring
 * yang SAMA yang dipakai `searchContent()` secara internal
 * (`@/utils/content/search.ts`, dibobot per field: judul, tags,
 * kategori, excerpt, dan teks/latin+terjemahan+konteks untuk
 * doa/dzikir/afirmasi) — bukan pencarian dummy baru. Hasilnya identik
 * dengan `searchContent()`, hanya tanpa pembacaan `fs` yang berulang.
 */
export function LibraryPageClient({ items }: LibraryPageClientProps) {
  const [query, setQuery] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState(ALL_CATEGORY_SLUG);
  const [favoritesOnly, setFavoritesOnly] = React.useState(false);

  const { isFavorite, toggle: toggleFavoriteItem } = useContentFavorites();
  const { progressMap, inProgressEntries, hydrated: progressHydrated } = useReadingProgress();

  // Kontrak `favorites: string[]` & `onToggleFavorite(slug)` di komponen
  // anak (ArticleCard, ContinueReadingSection, LatestArticlesSection)
  // sengaja dipertahankan supaya tidak perlu diubah — hanya sumber datanya
  // yang diganti dari localStorage ke `useContentFavorites` (IndexedDB).
  // Dicocokkan lewat `item.type` + slug (bukan slug saja) supaya jenis
  // konten berbeda dengan slug kebetulan sama tidak pernah tertukar.
  const favorites = React.useMemo(
    () => items.filter((item) => isFavorite(item.type, item.slug)).map((item) => item.slug),
    [items, isFavorite]
  );

  const toggleFavorite = React.useCallback(
    (slug: string) => {
      const item = items.find((candidate) => candidate.slug === slug);
      if (item) toggleFavoriteItem(item.type, slug);
    },
    [items, toggleFavoriteItem]
  );

  const latestArticles = React.useMemo(() => items.slice(0, LATEST_COUNT), [items]);

  const continueReadingItems = React.useMemo<ContinueReadingItem[]>(() => {
    if (!progressHydrated) return [];
    return inProgressEntries
      .map(([slug, entry]) => {
        const item = items.find((candidate) => candidate.slug === slug);
        return item ? { article: item, progress: entry.progress } : null;
      })
      .filter((entry): entry is ContinueReadingItem => entry !== null)
      .slice(0, CONTINUE_READING_COUNT);
  }, [inProgressEntries, progressHydrated, items]);

  const trimmedQuery = query.trim();

  // Item yang cocok query (Content Engine scoring), diurutkan dari skor
  // tertinggi — sama seperti hasil `searchContent()`. Jika query kosong,
  // pakai urutan asli (`getAllContent()` sudah terbaru lebih dulu).
  const searchedItems = React.useMemo(() => {
    if (!trimmedQuery) return items;
    return items
      .map((item) => ({ item, score: scoreContentItem(item, trimmedQuery).score }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .map(({ item }) => item);
  }, [items, trimmedQuery]);

  const filteredArticles = React.useMemo(() => {
    return searchedItems.filter((item) => {
      const matchesType = typeFilter === ALL_CATEGORY_SLUG || item.type === typeFilter;
      const matchesFavorite = !favoritesOnly || favorites.includes(item.slug);
      return matchesType && matchesFavorite;
    });
  }, [searchedItems, typeFilter, favoritesOnly, favorites]);

  const isFiltering = trimmedQuery.length > 0 || typeFilter !== ALL_CATEGORY_SLUG || favoritesOnly;

  function handleResetFilters() {
    setQuery("");
    setTypeFilter(ALL_CATEGORY_SLUG);
    setFavoritesOnly(false);
  }

  return (
    <div className="space-y-6 pb-4">
      <Reveal index={0}>
        <div className="relative flex items-center gap-4 overflow-hidden rounded-[1.75rem] bg-cahaya-100/50 px-5 py-5 sm:px-7 sm:py-6">
          <div
            className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-cahaya-300/30 blur-xl"
            aria-hidden
          />
          <Naniash pose="reading" size={92} priority className="relative shrink-0" />
          <div className="relative space-y-1">
            <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-cahaya-700">
              <BookOpen className="h-3.5 w-3.5" aria-hidden />
              Perpustakaan
            </p>
            <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
              Materi untuk Bunda
            </h1>
            <p className="text-sm text-muted-foreground">
              Kumpulan doa, dzikir, afirmasi, dan bacaan seputar kehamilan, persalinan, dan
              pengasuhan — tersimpan rapi dan mudah dicari.
            </p>
          </div>
        </div>
      </Reveal>

      <Reveal index={1}>
        <LibrarySearchBar value={query} onChange={setQuery} />
      </Reveal>

      <Reveal index={2}>
        <CategoryFilter
          selected={typeFilter}
          onSelect={setTypeFilter}
          showFavoritesOnly={favoritesOnly}
          onToggleFavoritesOnly={() => setFavoritesOnly((prev) => !prev)}
        />
      </Reveal>

      {!isFiltering && continueReadingItems.length > 0 && (
        <Reveal index={3}>
          <ContinueReadingSection
            items={continueReadingItems}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
          />
        </Reveal>
      )}

      {!isFiltering && (
        <Reveal index={4}>
          <LatestArticlesSection
            articles={latestArticles}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
          />
        </Reveal>
      )}

      <Reveal index={5}>
        <section className="space-y-3" aria-label="Semua materi">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-medium text-foreground">
              {isFiltering ? `Hasil pencarian (${filteredArticles.length})` : "Semua Materi"}
            </h2>
          </div>

          {filteredArticles.length === 0 ? (
            <LibraryEmptyState onReset={isFiltering ? handleResetFilters : undefined} />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredArticles.map((article) => (
                <ArticleCard
                  key={article.slug}
                  article={article}
                  isFavorite={favorites.includes(article.slug)}
                  onToggleFavorite={toggleFavorite}
                  progress={progressMap[article.slug]?.progress}
                />
              ))}
            </div>
          )}
        </section>
      </Reveal>
    </div>
  );
}
