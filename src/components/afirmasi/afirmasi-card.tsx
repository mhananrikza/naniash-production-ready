"use client";

import Link from "next/link";
import { Sun as SunIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FavoriteButton } from "@/components/library/favorite-button";
import { getAfirmasiCategoryBySlug } from "@/config/afirmasi";
import { cn } from "@/lib/utils";
import type { ContentItemMeta } from "@/types/content";

export type AfirmasiContentMeta = Extract<ContentItemMeta, { type: "afirmasi" }>;

export interface AfirmasiCardProps {
  afirmasi: AfirmasiContentMeta;
  isFavorite: boolean;
  onToggleFavorite: (slug: string) => void;
  className?: string;
}

/**
 * Kartu satu afirmasi di grid halaman `/afirmasi`. Berbeda dari
 * `DoaCard`/`DzikirCard`, afirmasi tidak punya teks Arab — cuplikan yang
 * ditampilkan adalah `text` (kalimat afirmasi utama) itu sendiri, sesuai
 * skema `AfirmasiContent`.
 */
export function AfirmasiCard({ afirmasi, isFavorite, onToggleFavorite, className }: AfirmasiCardProps) {
  const category = getAfirmasiCategoryBySlug(afirmasi.category);
  const CategoryIcon = category?.icon;

  return (
    <Link href={`/content/${afirmasi.slug}`} className="group block h-full">
      <Card
        className={cn(
          "relative flex h-full flex-col overflow-hidden border-senja-100 bg-senja-100/50 transition-all duration-200",
          "hover:-translate-y-0.5 hover:shadow-md hover:shadow-senja-500/10",
          className
        )}
      >
        <div className="flex items-start justify-between gap-3 p-5 pb-3">
          <span
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-senja-100 text-senja-700"
            aria-hidden
          >
            {CategoryIcon ? <CategoryIcon className="h-5 w-5" strokeWidth={1.75} /> : <SunIcon className="h-5 w-5" strokeWidth={1.75} />}
          </span>
          <FavoriteButton active={isFavorite} onToggle={() => onToggleFavorite(afirmasi.slug)} />
        </div>

        <CardContent className="flex flex-1 flex-col gap-2.5 pt-0">
          {category && (
            <Badge variant="secondary" className="w-fit gap-1">
              {CategoryIcon && <CategoryIcon className="h-3 w-3" />}
              {category.name}
            </Badge>
          )}

          <h3 className="line-clamp-2 font-display text-base font-medium leading-snug text-foreground transition-colors group-hover:text-primary">
            {afirmasi.title}
          </h3>

          <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">{afirmasi.text}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
