"use client";

import Link from "next/link";
import { BookOpen, ArrowRight, Sparkles } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Naniash } from "@/components/naniash/naniash";
import { SectionHeading } from "@/components/home/section-heading";
import { useReadingProgress } from "@/hooks/use-reading-progress";
import type { LibraryArticleMeta } from "@/types";

export interface ContinueReadingCardProps {
  /** Metadata artikel (tanpa body Markdown) dari Content Engine, dikirim Server Component `page.tsx`. */
  articles: LibraryArticleMeta[];
}

/**
 * "Lanjutkan Membaca" — progres baca disimpan lewat `useReadingProgress`
 * (localStorage), pola YANG SAMA dipakai halaman Perpustakaan, supaya satu
 * artikel yang sedang dibaca konsisten terlihat baik dari Home maupun
 * Library. Daftar artikel sendiri tetap dari Content Engine (props server),
 * bukan data contoh.
 */
export function ContinueReadingCard({ articles }: ContinueReadingCardProps) {
  const { inProgressEntries, hydrated } = useReadingProgress();

  if (!hydrated) return null;

  const [latestSlug, latestEntry] = inProgressEntries[0] ?? [];
  const article = latestSlug ? articles.find((item) => item.slug === latestSlug) : undefined;

  return (
    <div className="space-y-3">
      <SectionHeading title="Lanjutkan Membaca" />

      {article && latestEntry ? (
        <Link href={`/library/${article.slug}`} className="block">
          <Card className="border-cahaya-100 bg-cahaya-100/20 transition-shadow hover:shadow-md">
            <CardContent className="flex items-center gap-4 p-4">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-cahaya-100 text-cahaya-700">
                <BookOpen className="h-6 w-6" strokeWidth={1.75} />
              </span>

              <div className="min-w-0 flex-1 space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground">{article.category}</p>
                <p className="truncate font-display text-sm font-medium leading-tight text-foreground">
                  {article.title}
                </p>
                <div className="flex items-center gap-2 pt-0.5">
                  <Progress
                    value={latestEntry.progress}
                    className="max-w-[140px]"
                    aria-label="Progres bacaan"
                  />
                  <span className="text-xs text-muted-foreground">{latestEntry.progress}%</span>
                </div>
              </div>

              <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>
      ) : (
        <Card className="border-langit-100 bg-langit-50/40">
          <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
            <Naniash pose="reading" size={88} />
            <p className="max-w-xs text-sm text-muted-foreground">
              Belum ada bacaan yang sedang dilanjutkan. Yuk mulai jelajah Perpustakaan bersama
              Naniash.
            </p>
            <Link
              href="/library"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Jelajahi Perpustakaan
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
