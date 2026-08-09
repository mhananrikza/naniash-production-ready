"use client";

import * as React from "react";
import { BookOpen } from "lucide-react";

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
import { useLibraryFavorites } from "@/hooks/use-library-favorites";
import { useReadingProgress } from "@/hooks/use-reading-progress";
import type { LibraryArticleMeta } from "@/types";

export interface LibraryPageClientProps {
  articles: LibraryArticleMeta[];
}

const LATEST_COUNT = 6;
const CONTINUE_READING_COUNT = 6;

/**
 * Orkestrator interaktif halaman Perpustakaan: search, filter kategori,
 * favorit, "Lanjutkan Membaca", dan "Artikel Terbaru". Menerima data
 * artikel (hasil parsing Markdown) sebagai props dari Server Component
 * `app/(app)/library/page.tsx` — komponen ini sendiri tidak menyentuh
 * `fs`, hanya state UI + localStorage lewat hooks.
 */
export function LibraryPageClient({ articles }: LibraryPageClientProps) {
  const [query, setQuery] = React.useState("");
  const [category, setCategory] = React.useState(ALL_CATEGORY_SLUG);
  const [favoritesOnly, setFavoritesOnly] = React.useState(false);

  const { favorites, toggleFavorite } = useLibraryFavorites();
  const { progressMap, inProgressEntries, hydrated: progressHydrated } = useReadingProgress();

  const latestArticles = React.useMemo(() => articles.slice(0, LATEST_COUNT), [articles]);

  const continueReadingItems = React.useMemo<ContinueReadingItem[]>(() => {
    if (!progressHydrated) return [];
    return inProgressEntries
      .map(([slug, entry]) => {
        const article = articles.find((item) => item.slug === slug);
        return article ? { article, progress: entry.progress } : null;
      })
      .filter((item): item is ContinueReadingItem => item !== null)
      .slice(0, CONTINUE_READING_COUNT);
  }, [inProgressEntries, progressHydrated, articles]);

  const normalizedQuery = query.trim().toLowerCase();

  const filteredArticles = React.useMemo(() => {
    return articles.filter((article) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        article.title.toLowerCase().includes(normalizedQuery) ||
        article.excerpt.toLowerCase().includes(normalizedQuery) ||
        article.tags.some((tag) => tag.toLowerCase().includes(normalizedQuery));

      const matchesCategory = category === ALL_CATEGORY_SLUG || article.category === category;
      const matchesFavorite = !favoritesOnly || favorites.includes(article.slug);

      return matchesQuery && matchesCategory && matchesFavorite;
    });
  }, [articles, normalizedQuery, category, favoritesOnly, favorites]);

  const isFiltering = normalizedQuery.length > 0 || category !== ALL_CATEGORY_SLUG || favoritesOnly;

  function handleResetFilters() {
    setQuery("");
    setCategory(ALL_CATEGORY_SLUG);
    setFavoritesOnly(false);
  }

  return (
    <div className="space-y-6 pb-4">
      <Reveal index={0}>
        <div className="space-y-1">
          <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-primary">
            <BookOpen className="h-3.5 w-3.5" aria-hidden />
            Perpustakaan
          </p>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
            Materi untuk Bunda
          </h1>
          <p className="text-sm text-muted-foreground">
            Kumpulan bacaan seputar kehamilan, persalinan, dan pengasuhan — tersimpan rapi dan
            mudah dicari.
          </p>
        </div>
      </Reveal>

      <Reveal index={1}>
        <LibrarySearchBar value={query} onChange={setQuery} />
      </Reveal>

      <Reveal index={2}>
        <CategoryFilter
          selected={category}
          onSelect={setCategory}
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
