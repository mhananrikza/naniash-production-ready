"use client";

import Link from "next/link";
import { Clock } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { FavoriteButton } from "@/components/library/favorite-button";
import { getCategoryBySlug } from "@/config/library";
import { cn } from "@/lib/utils";
import type { LibraryArticleMeta } from "@/types";

export interface ArticleCardProps {
  article: LibraryArticleMeta;
  isFavorite: boolean;
  onToggleFavorite: (slug: string) => void;
  /** 0–100. Bila diisi, kartu menampilkan progress bar (mode "Lanjutkan Membaca"). */
  progress?: number;
  className?: string;
}

/**
 * Kartu artikel utama Perpustakaan — dipakai di grid utama, "Lanjutkan
 * Membaca", dan "Artikel Terbaru" supaya tampilannya konsisten di
 * seluruh halaman. Seluruh kartu bisa diklik menuju halaman detail;
 * tombol favorit di pojok menghentikan propagasi klik.
 */
export function ArticleCard({ article, isFavorite, onToggleFavorite, progress, className }: ArticleCardProps) {
  const category = getCategoryBySlug(article.category);
  const CategoryIcon = category?.icon;

  return (
    <Link href={`/library/${article.slug}`} className="group block h-full">
      <Card
        className={cn(
          "relative flex h-full flex-col overflow-hidden transition-all duration-200",
          "hover:-translate-y-0.5 hover:shadow-md hover:shadow-primary/5",
          className
        )}
      >
        <div className="flex items-start justify-between gap-3 p-5 pb-3">
          <span
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-langit text-xl"
            aria-hidden
          >
            {article.coverEmoji}
          </span>
          <FavoriteButton active={isFavorite} onToggle={() => onToggleFavorite(article.slug)} />
        </div>

        <CardContent className="flex flex-1 flex-col gap-2.5 pt-0">
          {category && (
            <Badge variant="secondary" className="w-fit gap-1">
              {CategoryIcon && <CategoryIcon className="h-3 w-3" />}
              {category.name}
            </Badge>
          )}

          <h3 className="line-clamp-2 font-display text-base font-medium leading-snug text-foreground transition-colors group-hover:text-primary">
            {article.title}
          </h3>

          <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">{article.excerpt}</p>

          <div className="mt-auto flex items-center gap-1.5 pt-2 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" aria-hidden />
            <span>{article.readingTimeMinutes} menit baca</span>
          </div>

          {typeof progress === "number" && (
            <div className="flex items-center gap-2 pt-1">
              <Progress
                value={progress}
                className="max-w-[120px]"
                aria-label={`Progres bacaan ${article.title}`}
              />
              <span className="text-xs text-muted-foreground">{progress}%</span>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
