"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowLeft, CalendarDays, Clock } from "lucide-react";

import { FavoriteButton } from "@/components/library/favorite-button";
import { Naniash } from "@/components/naniash/naniash";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useContentFavorite } from "@/hooks/use-content-favorite";
import { useReadingProgress } from "@/hooks/use-reading-progress";
import { getCategoryBySlug } from "@/config/library";
import type { LibraryArticle } from "@/types";

export interface ArticleReaderProps {
  article: LibraryArticle;
}

/**
 * Halaman detail/reader artikel. Melacak posisi scroll terhadap tinggi
 * konten untuk menyimpan progres baca (dipakai section "Lanjutkan
 * Membaca" di halaman daftar), dan menyediakan toggle favorit lewat
 * `useContentFavorite` (`favoritesService`/IndexedDB) — SATU sumber
 * kebenaran yang sama dipakai halaman Favorit, Perpustakaan, dan
 * `ContentReader`; bukan lagi `useLibraryFavorites` (localStorage).
 */
export function ArticleReader({ article }: ArticleReaderProps) {
  const router = useRouter();
  const contentRef = React.useRef<HTMLDivElement>(null);

  const { isFavorite, toggle: toggleFavorite } = useContentFavorite("artikel", article.slug);
  const { progressMap, updateProgress } = useReadingProgress();

  const category = getCategoryBySlug(article.category);
  const CategoryIcon = category?.icon;

  const [liveProgress, setLiveProgress] = React.useState(
    () => progressMap[article.slug]?.progress ?? 0
  );

  React.useEffect(() => {
    function handleScroll() {
      const node = contentRef.current;
      if (!node) return;

      const rect = node.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      // Progres dihitung dari seberapa jauh bagian bawah konten sudah
      // "dilewati" separuh viewport — konten pendek langsung terhitung
      // hampir 100% begitu terlihat penuh di layar.
      const total = rect.height - viewportHeight * 0.5;
      const scrolled = viewportHeight * 0.5 - rect.top;
      const percentage = total <= 0 ? 100 : (scrolled / total) * 100;
      const clamped = Math.min(100, Math.max(0, Math.round(percentage)));

      setLiveProgress(clamped);
      updateProgress(article.slug, clamped);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [article.slug, updateProgress]);

  const publishedLabel = new Date(article.publishedAt).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => router.push("/library")}
          className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Kembali ke Perpustakaan
        </button>
        <FavoriteButton active={isFavorite} onToggle={toggleFavorite} size="md" />
      </div>

      <Progress value={liveProgress} aria-label="Progres membaca artikel ini" />

      <header className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="relative flex h-16 w-16 shrink-0 items-center justify-center">
            <div
              className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-langit opacity-80 blur-[2px]"
              aria-hidden
            />
            <Naniash pose="reading" size={56} className="relative" decorative />
          </div>
          {category && (
            <Badge variant="secondary" className="gap-1">
              {CategoryIcon && <CategoryIcon className="h-3 w-3" />}
              {category.name}
            </Badge>
          )}
        </div>

        <h1 className="font-display text-2xl font-semibold leading-tight tracking-tight text-foreground sm:text-3xl">
          {article.title}
        </h1>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5" aria-hidden />
            {publishedLabel}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" aria-hidden />
            {article.readingTimeMinutes} menit baca
          </span>
          <span>Oleh {article.author}</span>
        </div>
      </header>

      <div
        ref={contentRef}
        className="prose prose-sm max-w-none prose-headings:font-display prose-headings:font-medium prose-headings:text-foreground prose-p:leading-relaxed prose-p:text-foreground/90 prose-strong:text-foreground prose-blockquote:border-primary/40 prose-blockquote:text-muted-foreground prose-a:text-primary sm:prose-base dark:prose-invert"
      >
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{article.content}</ReactMarkdown>
      </div>

      {article.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 border-t border-border pt-4">
          {article.tags.map((tag) => (
            <Badge key={tag} variant="outline">
              #{tag}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
