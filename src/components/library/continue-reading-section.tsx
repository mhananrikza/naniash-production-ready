"use client";

import { ArticleCard } from "@/components/library/article-card";
import type { LibraryArticleMeta } from "@/types";

export interface ContinueReadingItem {
  article: LibraryArticleMeta;
  progress: number;
}

export interface ContinueReadingSectionProps {
  items: ContinueReadingItem[];
  favorites: string[];
  onToggleFavorite: (slug: string) => void;
}

export function ContinueReadingSection({ items, favorites, onToggleFavorite }: ContinueReadingSectionProps) {
  if (items.length === 0) return null;

  return (
    <section className="space-y-3" aria-label="Lanjutkan membaca">
      <h2 className="font-display text-lg font-medium text-foreground">Lanjutkan Membaca</h2>
      <div className="-mx-1 flex gap-4 overflow-x-auto scrollbar-none px-1 pb-2">
        {items.map(({ article, progress }) => (
          <div key={article.slug} className="w-[260px] shrink-0 sm:w-[280px]">
            <ArticleCard
              article={article}
              isFavorite={favorites.includes(article.slug)}
              onToggleFavorite={onToggleFavorite}
              progress={progress}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
