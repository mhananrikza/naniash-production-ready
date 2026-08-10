"use client";

import Link from "next/link";
import { Repeat as RepeatIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FavoriteButton } from "@/components/library/favorite-button";
import { getDzikirCategoryBySlug } from "@/config/dzikir";
import { cn } from "@/lib/utils";
import type { ContentItemMeta } from "@/types/content";

export type DzikirContentMeta = Extract<ContentItemMeta, { type: "dzikir" }>;

export interface DzikirCardProps {
  dzikir: DzikirContentMeta;
  isFavorite: boolean;
  onToggleFavorite: (slug: string) => void;
  className?: string;
}

/**
 * Kartu satu dzikir di grid halaman `/dzikir`. Menampilkan cuplikan saja
 * (kategori, judul, terjemahan ringkas, jumlah anjuran pengulangan bila
 * ada) — teks Arab/Latin lengkap baru tampil di reader `/content/[slug]`,
 * sama seperti pola `DoaCard`.
 */
export function DzikirCard({ dzikir, isFavorite, onToggleFavorite, className }: DzikirCardProps) {
  const category = getDzikirCategoryBySlug(dzikir.category);
  const CategoryIcon = category?.icon;

  return (
    <Link href={`/content/${dzikir.slug}`} className="group block h-full">
      <Card
        className={cn(
          "relative flex h-full flex-col overflow-hidden border-nur-100 bg-nur-100/50 transition-all duration-200",
          "hover:-translate-y-0.5 hover:shadow-md hover:shadow-nur-500/10",
          className
        )}
      >
        <div className="flex items-start justify-between gap-3 p-5 pb-3">
          <span
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-nur-100 text-nur-700"
            aria-hidden
          >
            {CategoryIcon ? <CategoryIcon className="h-5 w-5" strokeWidth={1.75} /> : <RepeatIcon className="h-5 w-5" strokeWidth={1.75} />}
          </span>
          <FavoriteButton active={isFavorite} onToggle={() => onToggleFavorite(dzikir.slug)} />
        </div>

        <CardContent className="flex flex-1 flex-col gap-2.5 pt-0">
          <div className="flex flex-wrap items-center gap-1.5">
            {category && (
              <Badge variant="secondary" className="w-fit gap-1">
                {CategoryIcon && <CategoryIcon className="h-3 w-3" />}
                {category.name}
              </Badge>
            )}
            {typeof dzikir.repeatCount === "number" && (
              <Badge variant="outline" className="w-fit">
                {dzikir.repeatCount}x
              </Badge>
            )}
          </div>

          <h3 className="line-clamp-2 font-display text-base font-medium leading-snug text-foreground transition-colors group-hover:text-primary">
            {dzikir.title}
          </h3>

          <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {dzikir.translationId}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
