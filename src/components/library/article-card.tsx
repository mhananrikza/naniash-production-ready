"use client";

import Link from "next/link";
import { Clock } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { FavoriteButton } from "@/components/library/favorite-button";
import { contentTypeMeta } from "@/config/content-type";
import { cn } from "@/lib/utils";
import type { ContentItemMeta } from "@/types/content";

export interface ArticleCardProps {
  article: ContentItemMeta;
  isFavorite: boolean;
  onToggleFavorite: (slug: string) => void;
  /** 0–100. Bila diisi, kartu menampilkan progress bar (mode "Lanjutkan Membaca"). */
  progress?: number;
  className?: string;
}

/**
 * Kartu materi utama Perpustakaan — dipakai di grid utama, "Lanjutkan
 * Membaca", dan "Artikel Terbaru" supaya tampilannya konsisten di
 * seluruh halaman. Berlaku untuk keempat jenis materi Content Engine
 * (doa, dzikir, afirmasi, artikel), bukan hanya artikel seperti
 * sebelumnya.
 *
 * Badge kategori tematik lama (`getCategoryBySlug`, khusus artikel)
 * diganti badge JENIS materi (`contentTypeMeta`) karena `category` doa/
 * dzikir/afirmasi memakai taksonomi yang berbeda dari artikel — badge
 * jenis materi berlaku konsisten untuk semua kartu.
 *
 * Tautan menuju Reader yang SUDAH ADA sesuai jenisnya: artikel tetap ke
 * `/library/[slug]` (`ArticleReader`, tidak diubah), jenis lain ke
 * `/content/[slug]` (`ContentReader`, Reader universal yang memang sudah
 * dibangun untuk doa/dzikir/afirmasi/artikel) — tidak ada Reader baru.
 */
export function ArticleCard({ article, isFavorite, onToggleFavorite, progress, className }: ArticleCardProps) {
  const meta = contentTypeMeta[article.type];
  const TypeIcon = meta.icon;
  const href = article.type === "artikel" ? `/library/${article.slug}` : `/content/${article.slug}`;

  return (
    <Link href={href} className="group block h-full">
      <Card
        className={cn(
          "relative flex h-full flex-col overflow-hidden border-cahaya-100 bg-cahaya-100/30 transition-all duration-200",
          "hover:-translate-y-0.5 hover:shadow-md hover:shadow-cahaya-500/10",
          className
        )}
      >
        <div className="flex items-start justify-between gap-3 p-5 pb-3">
          <span
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-cahaya-100 text-cahaya-700"
            aria-hidden
          >
            <TypeIcon className="h-5 w-5" strokeWidth={1.75} />
          </span>
          <FavoriteButton active={isFavorite} onToggle={() => onToggleFavorite(article.slug)} />
        </div>

        <CardContent className="flex flex-1 flex-col gap-2.5 pt-0">
          <Badge variant="secondary" className="w-fit gap-1">
            <TypeIcon className="h-3 w-3" />
            {meta.label}
          </Badge>

          <h3 className="line-clamp-2 font-display text-base font-medium leading-snug text-foreground transition-colors group-hover:text-primary">
            {article.title}
          </h3>

          <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">{article.excerpt}</p>

          {article.type === "artikel" && (
            <div className="mt-auto flex items-center gap-1.5 pt-2 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" aria-hidden />
              <span>{article.readingTimeMinutes} menit baca</span>
            </div>
          )}

          {typeof progress === "number" && (
            <div className={cn("flex items-center gap-2 pt-1", article.type !== "artikel" && "mt-auto")}>
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
