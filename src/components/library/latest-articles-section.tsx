"use client";

import { ArticleCard } from "@/components/library/article-card";
import type { LibraryArticleMeta } from "@/types";

export interface LatestArticlesSectionProps {
  articles: LibraryArticleMeta[];
  favorites: string[];
  onToggleFavorite: (slug: string) => void;
}

export function LatestArticlesSection({ articles, favorites, onToggleFavorite }: LatestArticlesSectionProps) {
  if (articles.length === 0) return null;

  return (
    <section className="space-y-3" aria-label="Artikel terbaru">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-medium text-foreground">Artikel Terbaru</h2>
        <span className="text-xs text-muted-foreground">Baru ditambahkan</span>
      </div>
      <div className="-mx-1 flex gap-4 overflow-x-auto scrollbar-none px-1 pb-2">
        {articles.map((article) => (
          <div key={article.slug} className="w-[260px] shrink-0 sm:w-[280px]">
            <ArticleCard
              article={article}
              isFavorite={favorites.includes(article.slug)}
              onToggleFavorite={onToggleFavorite}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
