"use client";

import * as React from "react";
import { Check, Loader2, BookOpen } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { isIndexedDbSupported, journalService } from "@/lib/db";
import type { JournalRecord } from "@/lib/db/models";

/** Penanda `mood` khusus supaya entri jurnal dari Daily Journey bisa dibedakan dari jurnal bebas — bukan field/store baru, hanya nilai yang disepakati. */
const REFLECTION_MOOD_MARKER = "daily-journey-refleksi";

const REFLECTION_QUESTION = "Apa yang ingin Bunda syukuri hari ini?";

export interface JourneyReflectionCardProps {
  /** Tanggal Daily Journey saat ini (`YYYY-MM-DD`), dipakai mencari entri jurnal hari ini. */
  date: string;
  done: boolean;
  /** Panggil setelah refleksi berhasil disimpan, supaya slot "artikel" ditandai selesai lewat Daily Journey Engine. */
  onComplete: () => Promise<void> | void;
}

/**
 * Kartu "Refleksi" — slot ke-4 Daily Journey. Berbeda dari Doa/Dzikir/
 * Afirmasi (yang membuka Content Reader), Refleksi menulis jawaban singkat
 * langsung di kartu ini, disimpan lewat `journalService` (Journal Service
 * yang SUDAH ADA, store `journal` di IndexedDB) — tidak ada store baru.
 * Begitu tersimpan, `onComplete` dipanggil supaya Daily Journey Engine
 * menandai slot ini selesai (store `dailyJourney`, juga sudah ada).
 */
export function JourneyReflectionCard({ date, done, onComplete }: JourneyReflectionCardProps) {
  const prefersReducedMotion = useReducedMotion();
  const [expanded, setExpanded] = React.useState(false);
  const [answer, setAnswer] = React.useState("");
  const [entry, setEntry] = React.useState<JournalRecord | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [loaded, setLoaded] = React.useState(false);

  // Muat entri refleksi hari ini (bila ada) sekali saat mount / ganti tanggal —
  // supaya jawaban yang sudah ditulis tetap terlihat setelah reload halaman.
  React.useEffect(() => {
    if (!isIndexedDbSupported()) {
      setLoaded(true);
      return;
    }
    let cancelled = false;

    journalService.getByDate(date).then((entries) => {
      if (cancelled) return;
      const existing = entries.find((item) => item.mood === REFLECTION_MOOD_MARKER) ?? null;
      setEntry(existing);
      setAnswer(existing?.content ?? "");
      setLoaded(true);
    });

    return () => {
      cancelled = true;
    };
  }, [date]);

  async function handleSave() {
    const trimmed = answer.trim();
    if (!trimmed || saving) return;

    setSaving(true);
    try {
      if (entry) {
        const updated = await journalService.update(entry.id, { content: trimmed, date });
        setEntry(updated);
      } else {
        const created = await journalService.create({
          date,
          content: trimmed,
          mood: REFLECTION_MOOD_MARKER,
          moodEmoji: "📝",
        });
        setEntry(created);
      }
      setExpanded(false);
      await onComplete();
    } finally {
      setSaving(false);
    }
  }

  const canSave = answer.trim().length > 0 && !saving;

  return (
    <Card className={cn("overflow-hidden transition-colors", done ? "border-primary/40 bg-primary/5" : "border-cahaya-100 bg-cahaya-100/20")}>
      <CardContent className="space-y-4 p-5">
        <div className="flex items-center gap-4">
          <div
            className={cn(
              "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl",
              done ? "bg-primary/15 text-primary" : "bg-cahaya-100 text-cahaya-700"
            )}
            aria-hidden
          >
            <BookOpen className="h-6 w-6" strokeWidth={1.75} />
          </div>

          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-display text-base font-medium tracking-tight text-foreground">
                Refleksi
              </h3>
              <Badge variant={done ? "default" : "outline"} className="shrink-0">
                {done ? (
                  <>
                    <Check className="h-3 w-3" strokeWidth={3} />
                    Selesai
                  </>
                ) : (
                  "Belum selesai"
                )}
              </Badge>
            </div>
            <p className="truncate text-sm text-muted-foreground">
              {done && entry ? entry.content : REFLECTION_QUESTION}
            </p>
          </div>

          {!expanded && (
            <Button
              type="button"
              size="sm"
              variant={done ? "outline" : "default"}
              onClick={() => setExpanded(true)}
              disabled={!loaded}
              className="shrink-0 rounded-full"
            >
              {done ? "Ubah" : "Mulai"}
            </Button>
          )}
        </div>

        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              initial={prefersReducedMotion ? undefined : { opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={prefersReducedMotion ? undefined : { opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="space-y-3 overflow-hidden"
            >
              <p className="text-sm font-medium text-foreground">{REFLECTION_QUESTION}</p>
              <textarea
                value={answer}
                onChange={(event) => setAnswer(event.target.value)}
                placeholder="Tulis rasa syukur Bunda hari ini…"
                rows={4}
                autoFocus
                className="w-full resize-none rounded-xl border border-border bg-background p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <div className="flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setExpanded(false);
                    setAnswer(entry?.content ?? "");
                  }}
                >
                  Batal
                </Button>
                <Button type="button" size="sm" onClick={handleSave} disabled={!canSave}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
                  Simpan Refleksi
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
