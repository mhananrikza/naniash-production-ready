"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useReaderFontSize } from "@/hooks/use-reader-font-size";
import type { ReaderFontSize } from "@/hooks/use-reader-font-size";
import { cn } from "@/lib/utils";

const SIZE_LABELS: Record<ReaderFontSize, string> = {
  sm: "A−",
  md: "A",
  lg: "A+",
};

const SIZE_PREVIEW_CLASS: Record<ReaderFontSize, string> = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
};

/**
 * Section "Reader" (Prompt 25, bagian 3): ukuran font A− | A | A+.
 * Memakai hook `useReaderFontSize` yang sudah ada (store `settings`, key
 * `"reader:fontSize"`) — sama persis yang dipakai halaman Reader konten,
 * jadi perubahan di sini langsung terasa di halaman baca doa/dzikir/
 * afirmasi/artikel.
 */
export function ReaderSection() {
  const { size, hydrated, setLevel } = useReaderFontSize();

  const sizes: ReaderFontSize[] = ["sm", "md", "lg"];

  return (
    <section id="reader" aria-labelledby="reader-heading" className="scroll-mt-24">
      <Card>
        <CardHeader>
          <CardTitle id="reader-heading">Reader</CardTitle>
          <CardDescription>Ukuran huruf saat membaca doa, dzikir, afirmasi, dan artikel.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div role="radiogroup" aria-label="Ukuran font" className="flex items-center gap-2.5">
            {sizes.map((option) => {
              const isActive = size === option;
              return (
                <button
                  key={option}
                  type="button"
                  role="radio"
                  aria-checked={isActive}
                  disabled={!hydrated}
                  onClick={() => setLevel(option)}
                  className={cn(
                    "flex h-12 flex-1 items-center justify-center rounded-xl border font-display font-medium transition-colors disabled:cursor-not-allowed",
                    isActive
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:bg-muted"
                  )}
                >
                  {SIZE_LABELS[option]}
                </button>
              );
            })}
          </div>

          <p className={cn("rounded-lg bg-muted/60 p-3 leading-relaxed text-foreground", SIZE_PREVIEW_CLASS[size])}>
            Contoh teks bacaan dengan ukuran ini.
          </p>
        </CardContent>
      </Card>
    </section>
  );
}
