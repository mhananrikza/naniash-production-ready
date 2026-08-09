"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, Share2, Minus, Plus, Copy, Check, Loader2, PartyPopper } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Naniash } from "@/components/naniash/naniash";
import { useContentFavorite } from "@/hooks/use-content-favorite";
import { useContentReadingHistory } from "@/hooks/use-content-reading-history";
import { useReaderFontSize, type ReaderFontSize } from "@/hooks/use-reader-font-size";
import { contentTypeMeta } from "@/config/content-type";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";
import { dailyJourneyService, isIndexedDbSupported } from "@/lib/db";
import type { ContentItem } from "@/types/content";
import type { DailyJourneySlot } from "@/types/daily-journey";

/** Slot Daily Journey yang valid untuk ditandai selesai dari Content Reader — "artikel" (Refleksi) tidak lewat sini, tapi lewat kartu Refleksi sendiri di halaman Daily Journey. */
const MARKABLE_DAILY_JOURNEY_SLOTS: readonly DailyJourneySlot[] = ["doa", "dzikir", "afirmasi"];

export interface ContentReaderProps {
  item: ContentItem;
}

const FONT_SIZE_CLASS: Record<ReaderFontSize, { body: string; arabic: string }> = {
  sm: { body: "text-[15px] leading-[1.85]", arabic: "text-[22px] leading-[2.1]" },
  md: { body: "text-[17px] leading-[1.9]", arabic: "text-[26px] leading-[2.15]" },
  lg: { body: "text-[19px] leading-[2]", arabic: "text-[30px] leading-[2.2]" },
};

const NANIASH_CLOSING_MESSAGE =
  "Semoga materi ini menjadi ikhtiar kecil yang membawa ketenangan untuk Bunda dan keluarga. 🌷";

/**
 * Halaman Detail / Reader universal untuk seluruh jenis materi Content
 * Engine (doa, dzikir, afirmasi, artikel) — satu komponen dipakai lewat
 * rute tunggal `/content/[slug]` (Prompt 22), supaya tombol "Baca Doa" di
 * Home & Library cukup menuju satu tempat yang sama. Semua data konten
 * datang dari Server Component `page.tsx` (Content Engine, hasil parsing
 * Markdown lokal) — komponen ini murni UI + integrasi service lokal yang
 * SUDAH ADA (`favoritesService`, `readingHistoryService`, `settingsService`),
 * tidak ada fetch API maupun store baru, sehingga tetap 100% berfungsi
 * offline.
 */
export function ContentReader({ item }: ContentReaderProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefersReducedMotion = useReducedMotion();
  const meta = contentTypeMeta[item.type];
  const TypeIcon = meta.icon;

  // Konteks Daily Journey (Prompt 23): materi ini dibuka dari kartu
  // aktivitas di `/perjalanan-harian` (lihat `JourneyActivityCard`), ditandai
  // lewat query string `?from=daily-journey&slot=...` — bukan state global
  // baru, cukup dibaca dari URL supaya reader tetap komponen universal yang
  // bisa dibuka dari mana saja (Home, Library, Daily Journey).
  const journeySlot = MARKABLE_DAILY_JOURNEY_SLOTS.find(
    (slot) => slot === item.type && searchParams.get("slot") === slot
  );
  const fromDailyJourney = searchParams.get("from") === "daily-journey" && !!journeySlot;
  const [markingDone, setMarkingDone] = React.useState(false);

  async function handleMarkDoneAndReturn() {
    if (!journeySlot || markingDone) return;
    setMarkingDone(true);
    try {
      if (isIndexedDbSupported()) {
        await dailyJourneyService.setSlotComplete(journeySlot, true);
      }
    } finally {
      router.push("/perjalanan-harian");
    }
  }

  const { isFavorite, toggle: toggleFavorite, hydrated: favoriteHydrated } = useContentFavorite(
    item.type,
    item.slug
  );
  const { contentRef, progress } = useContentReadingHistory(item.type, item.slug);
  const { size, increase, decrease, canIncrease, canDecrease } = useReaderFontSize();
  const [copied, setCopied] = React.useState(false);

  const fontClass = FONT_SIZE_CLASS[size];

  // `doa` dan `dzikir` sama-sama punya bacaan Arab/Latin/terjemahan/konteks;
  // narrowing manual di sini (bukan `in`/`as`) supaya tetap type-safe atas
  // union diskriminatif `ContentItem`.
  const bacaan =
    item.type === "doa" || item.type === "dzikir"
      ? {
          arabicText: item.arabicText,
          latinText: item.latinText,
          translationId: item.translationId,
          dalil: item.type === "doa" ? item.dalil : undefined,
          context: item.context,
        }
      : null;

  const hasArabic = !!bacaan?.arabicText.trim();
  const hasLatin = !!bacaan?.latinText.trim();
  const hasTranslation = !!bacaan?.translationId.trim();
  const hasSource = !!bacaan?.dalil;
  const hasContext = !!bacaan?.context.length;

  async function handleShare() {
    const url = `${siteConfig.url}/content/${item.slug}`;
    const shareData = { title: item.title, text: item.excerpt, url };

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // Dibatalkan pengguna atau gagal — jatuh ke fallback salin tautan.
      }
    }

    if (typeof navigator !== "undefined" && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2000);
      } catch {
        // Tidak ada Web Share API maupun Clipboard API — biarkan diam,
        // tombol tetap terlihat tapi tidak melakukan apa-apa daripada error.
      }
    }
  }

  return (
    <div className="mx-auto w-full max-w-[680px] space-y-6 pb-16">
      {/* Header aksi: kembali, favorit, share */}
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => (fromDailyJourney ? router.push("/perjalanan-harian") : router.back())}
          className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          {fromDailyJourney ? "Kembali ke Perjalanan" : "Kembali"}
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleShare}
            aria-label="Bagikan"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
          >
            {copied ? (
              <Check className="h-4 w-4 text-primary" aria-hidden />
            ) : (
              <Share2 className="h-4 w-4" aria-hidden />
            )}
          </button>

          <button
            type="button"
            onClick={toggleFavorite}
            disabled={!favoriteHydrated}
            aria-pressed={isFavorite}
            aria-label={isFavorite ? "Hapus dari favorit" : "Simpan ke favorit"}
            className={cn(
              "flex h-9 items-center gap-1.5 rounded-full border px-3 text-xs font-medium transition-colors disabled:opacity-50",
              isFavorite
                ? "border-destructive/40 bg-destructive/5 text-destructive"
                : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
            )}
          >
            <span aria-hidden>{isFavorite ? "❤️" : "♡"}</span>
            {isFavorite ? "Favorit" : "Simpan"}
          </button>
        </div>
      </div>

      {copied && (
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Copy className="h-3 w-3" aria-hidden />
          Tautan disalin — siap dibagikan lewat aplikasi apa pun.
        </p>
      )}

      {/* Progres membaca */}
      <Progress value={progress} aria-label={`Progres membaca ${meta.label.toLowerCase()} ini`} />

      {/* Breadcrumb / kategori */}
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
        <span>{meta.indexLabel}</span>
        <span aria-hidden>/</span>
        <span className="text-foreground">{item.category}</span>
      </nav>

      {/* Header konten: ilustrasi, badge, judul */}
      <header className="space-y-4 text-center">
        <Naniash pose="reading" size={72} className="mx-auto" />

        <div className="flex items-center justify-center gap-2">
          <Badge variant="secondary" className="gap-1">
            <TypeIcon className="h-3 w-3" aria-hidden />
            {meta.label}
          </Badge>
          <span className="text-2xl" aria-hidden>
            {item.coverEmoji}
          </span>
        </div>

        <h1 className="font-display text-2xl font-semibold leading-tight tracking-tight text-foreground sm:text-3xl">
          {item.title}
        </h1>
      </header>

      {/* Kontrol ukuran font */}
      <div className="flex items-center justify-center gap-1 rounded-full border border-border bg-card p-1 mx-auto w-fit">
        <button
          type="button"
          onClick={decrease}
          disabled={!canDecrease}
          aria-label="Perkecil huruf"
          className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-30"
        >
          <Minus className="h-3 w-3" aria-hidden />
          <span className="sr-only">A−</span>
        </button>
        <span className="px-2 text-sm font-medium text-foreground" aria-hidden>
          A
        </span>
        <button
          type="button"
          onClick={increase}
          disabled={!canIncrease}
          aria-label="Perbesar huruf"
          className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-30"
        >
          <Plus className="h-3 w-3" aria-hidden />
          <span className="sr-only">A+</span>
        </button>
      </div>

      {/* Konten utama — background lembut, whitespace lega, lebar baca maksimum */}
      <div
        ref={contentRef}
        className="space-y-7 rounded-3xl border border-border/60 bg-card/60 p-5 shadow-sm sm:p-8"
      >
        {hasArabic && bacaan && (
          <p dir="rtl" lang="ar" className={cn("text-right text-foreground", fontClass.arabic)}>
            {bacaan.arabicText}
          </p>
        )}

        {hasLatin && bacaan && (
          <p className={cn("italic text-foreground/90", fontClass.body)}>{bacaan.latinText}</p>
        )}

        {hasTranslation && bacaan && (
          <div className="space-y-1.5 border-l-2 border-primary/40 pl-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Artinya</p>
            <p className={cn("text-foreground/90", fontClass.body)}>{bacaan.translationId}</p>
          </div>
        )}

        {item.type === "afirmasi" && (
          <p className={cn("text-center font-display font-medium text-foreground", fontClass.body)}>
            {item.text}
          </p>
        )}

        {(hasArabic || hasLatin || hasTranslation || item.type === "afirmasi") && item.content && (
          <Separator />
        )}

        {item.content && (
          <div
            className={cn(
              "max-w-none text-foreground/90",
              "prose prose-sm sm:prose-base dark:prose-invert",
              "prose-headings:font-display prose-headings:font-medium prose-headings:text-foreground",
              "prose-p:leading-relaxed prose-strong:text-foreground prose-a:text-primary",
              "prose-blockquote:border-primary/40 prose-blockquote:text-muted-foreground",
              fontClass.body
            )}
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{item.content}</ReactMarkdown>
          </div>
        )}

        {hasContext && bacaan && (
          <div className="space-y-2 border-t border-border/60 pt-5">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Cocok dibaca saat
            </p>
            <div className="flex flex-wrap gap-2">
              {bacaan.context.map((situation) => (
                <Badge key={situation} variant="outline">
                  {situation}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {hasSource && bacaan && (
          <p className="border-t border-border/60 pt-4 text-xs text-muted-foreground">
            Sumber: {bacaan.dalil}
          </p>
        )}

        {item.type === "artikel" && (
          <p className="border-t border-border/60 pt-4 text-xs text-muted-foreground">
            Oleh {item.author}
          </p>
        )}
      </div>

      {item.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {item.tags.map((tag) => (
            <Badge key={tag} variant="outline">
              #{tag}
            </Badge>
          ))}
        </div>
      )}

      {/* Pesan penutup Naniash — singkat, satu saja, supaya fokus tetap di materi */}
      <motion.div
        initial={prefersReducedMotion ? undefined : { opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="flex items-start gap-3 rounded-2xl bg-muted/50 p-4"
      >
        <Naniash pose="welcome" size={40} className="shrink-0" />
        <p className="text-sm leading-relaxed text-muted-foreground">{NANIASH_CLOSING_MESSAGE}</p>
      </motion.div>

      {/* CTA khusus konteks Daily Journey — menandai slot selesai lewat
          Daily Journey Engine (`dailyJourneyService.setSlotComplete`, sudah
          ada) lalu kembali ke `/perjalanan-harian`. */}
      {fromDailyJourney && (
        <motion.div
          initial={prefersReducedMotion ? undefined : { opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <Button
            type="button"
            size="lg"
            onClick={handleMarkDoneAndReturn}
            disabled={markingDone}
            className="w-full gap-2 rounded-full"
          >
            {markingDone ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <PartyPopper className="h-4 w-4" aria-hidden />
            )}
            Tandai Selesai & Kembali ke Perjalanan
          </Button>
        </motion.div>
      )}
    </div>
  );
}
