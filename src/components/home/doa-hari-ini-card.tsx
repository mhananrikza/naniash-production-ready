"use client";

import * as React from "react";
import Link from "next/link";
import { Heart } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { SectionHeading } from "@/components/home/section-heading";
import { cn } from "@/lib/utils";
import { isIndexedDbSupported, favoritesService } from "@/lib/db";
import type { DailyJourneyDay } from "@/types/daily-journey";

export interface DoaHariIniCardProps {
  status: "idle" | "loading" | "ready" | "error";
  day: DailyJourneyDay | null;
}

/**
 * "Doa Hari Ini" — mengambil doa yang SAMA dengan slot "doa" di Daily
 * Journey Engine untuk hari ini (satu sumber kebenaran, bukan pemilihan
 * terpisah), lalu hanya menampilkan cuplikan (kategori, judul, excerpt)
 * sesuai instruksi: isi doa lengkap TIDAK ditampilkan di Home, baru muncul
 * di halaman detail/reader universal (`/content/[slug]`, lihat Prompt 22).
 *
 * Status favorit dibaca/ditulis lewat `favoritesService` (IndexedDB) —
 * bukan localStorage — supaya konsisten dengan penyimpanan lokal lain di
 * Home (Daily Journey, Challenge, Journal).
 */
export function DoaHariIniCard({ status, day }: DoaHariIniCardProps) {
  const doa = day?.items.doa ?? null;
  const [isFavorite, setIsFavorite] = React.useState(false);
  const [favoriteLoaded, setFavoriteLoaded] = React.useState(false);

  React.useEffect(() => {
    if (!doa || !isIndexedDbSupported()) return;
    let cancelled = false;

    favoritesService.isFavorite("doa", doa.slug).then((value) => {
      if (!cancelled) {
        setIsFavorite(value);
        setFavoriteLoaded(true);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [doa]);

  async function handleToggleFavorite() {
    if (!doa) return;
    // Optimistic — dibalik lagi kalau ternyata gagal, supaya interaksi terasa instan.
    setIsFavorite((prev) => !prev);
    try {
      const next = await favoritesService.toggle("doa", doa.slug);
      setIsFavorite(next);
    } catch {
      setIsFavorite((prev) => !prev);
    }
  }

  return (
    <div className="space-y-3">
      <SectionHeading title="Doa Hari Ini" href="/doa" />

      <Card>
        <CardContent className="space-y-3 p-5">
          {status === "loading" || status === "idle" || !doa ? (
            <div className="space-y-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-4 w-full" />
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 space-y-1">
                  <Badge variant="secondary">{doa.category}</Badge>
                  <p className="font-display text-base font-medium leading-snug text-foreground">
                    {doa.coverEmoji} {doa.title}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleToggleFavorite}
                  disabled={!favoriteLoaded}
                  aria-pressed={isFavorite}
                  aria-label={isFavorite ? "Hapus dari favorit" : "Tandai sebagai favorit"}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-senja-500 disabled:opacity-50"
                >
                  <Heart
                    className={cn("h-5 w-5", isFavorite && "fill-senja-500 text-senja-500")}
                    strokeWidth={1.75}
                  />
                </button>
              </div>

              <p className="text-sm leading-relaxed text-muted-foreground">{doa.excerpt}</p>

              <Link
                href={`/content/${doa.slug}`}
                className="inline-flex items-center text-sm font-medium text-primary hover:underline"
              >
                Baca Doa
              </Link>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
