"use client";

import Link from "next/link";
import { HandHeart } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FavoriteButton } from "@/components/library/favorite-button";
import { getDoaCategoryBySlug } from "@/config/doa";
import { cn } from "@/lib/utils";
import type { ContentItemMeta } from "@/types/content";

export type DoaContentMeta = Extract<ContentItemMeta, { type: "doa" }>;

export interface DoaCardProps {
  doa: DoaContentMeta;
  isFavorite: boolean;
  onToggleFavorite: (slug: string) => void;
  className?: string;
}

/**
 * Kartu satu doa di grid halaman `/doa`. Menampilkan cuplikan saja
 * (kategori, judul, terjemahan ringkas) — teks Arab/Latin lengkap baru
 * tampil di reader `/content/[slug]`. Pola identik `DzikirCard`.
 */
export function DoaCard({ doa, isFavorite, onToggleFavorite, className }: DoaCardProps) {
  const category = getDoaCategoryBySlug(doa.category);
  const CategoryIcon = category?.icon;

  return (
    <Link href={`/content/${doa.slug}`} className="group block h-full">
      <Card
        className={cn(
          "relative flex h-full flex-col overflow-hidden border-langit-100 bg-langit-50/70 transition-all duration-200",
          "hover:-translate-y-0.5 hover:shadow-md hover:shadow-langit-500/10",
          className
        )}
      >
        <div className="flex items-start justify-between gap-3 p-5 pb-3">
          <span
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-langit-100 text-langit-700"
            aria-hidden
          >
            {CategoryIcon ? <CategoryIcon className="h-5 w-5" strokeWidth={1.75} /> : <HandHeart className="h-5 w-5" strokeWidth={1.75} />}
          </span>
          <FavoriteButton active={isFavorite} onToggle={() => onToggleFavorite(doa.slug)} />
        </div>

        <CardContent className="flex flex-1 flex-col gap-2.5 pt-0">
          <div className="flex flex-wrap items-center gap-1.5">
            {category && (
              <Badge variant="secondary" className="w-fit gap-1">
                {CategoryIcon && <CategoryIcon className="h-3 w-3" />}
                {category.name}
              </Badge>
            )}
          </div>

          <h3 className="line-clamp-2 font-display text-base font-medium leading-snug text-foreground transition-colors group-hover:text-primary">
            {doa.title}
          </h3>

          <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {doa.translationId}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
