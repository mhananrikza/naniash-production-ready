"use client";

import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { DailyJourneySlot } from "@/types/daily-journey";
import type { useDailyJourney } from "@/hooks/use-daily-journey";

const RADIUS = 30;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const SLOT_LABELS: Record<DailyJourneySlot, string> = {
  doa: "Doa",
  dzikir: "Dzikir",
  afirmasi: "Afirmasi",
  artikel: "Refleksi",
};

/** Urutan tampil tetap: Doa → Dzikir → Afirmasi → Refleksi, sesuai copy Prompt 21. */
const SLOT_ORDER: DailyJourneySlot[] = ["doa", "dzikir", "afirmasi", "artikel"];

function ProgressRing({ percent }: { percent: number }) {
  const prefersReducedMotion = useReducedMotion();
  const offset = CIRCUMFERENCE - (percent / 100) * CIRCUMFERENCE;

  return (
    <div className="relative flex h-20 w-20 shrink-0 items-center justify-center">
      <svg viewBox="0 0 72 72" className="h-20 w-20 -rotate-90">
        <circle cx={36} cy={36} r={RADIUS} fill="none" strokeWidth={7} className="stroke-muted" />
        <motion.circle
          cx={36}
          cy={36}
          r={RADIUS}
          fill="none"
          strokeWidth={7}
          strokeLinecap="round"
          className="stroke-primary"
          strokeDasharray={CIRCUMFERENCE}
          initial={{ strokeDashoffset: prefersReducedMotion ? offset : CIRCUMFERENCE }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </svg>
      <span className="absolute font-display text-lg font-semibold text-foreground">{percent}%</span>
    </div>
  );
}

export type DailyJourneyCardProps = Pick<
  ReturnType<typeof useDailyJourney>,
  "status" | "day" | "error" | "setSlotComplete"
>;

/**
 * Kartu "Daily Journey" — inti Home. Materi & status selesai/belum berasal
 * langsung dari Daily Journey Engine (`useDailyJourney`, IndexedDB), bukan
 * data contoh. Anchor `#perjalanan-hari-ini` jadi tujuan tombol Hero Card.
 *
 * Menerima state sebagai props (bukan memanggil `useDailyJourney` sendiri)
 * supaya satu-satunya sumber data dipegang oleh `HomeDashboardClient` dan
 * dipakai bareng oleh `DoaHariIniCard` — tidak fetch manifest & baca
 * IndexedDB dua kali untuk data yang sama.
 */
export function DailyJourneyCard({ status, day, error, setSlotComplete }: DailyJourneyCardProps) {
  const doneCount = day ? SLOT_ORDER.filter((slot) => day.completion[slot]).length : 0;
  const percent = day ? Math.round((doneCount / SLOT_ORDER.length) * 100) : 0;

  return (
    <div id="perjalanan-hari-ini" className="scroll-mt-20 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-base font-medium tracking-tight text-foreground">
          Perjalanan Hari Ini
        </h2>
        <div className="flex items-center gap-3">
          {day ? (
            <span className="text-xs font-medium text-muted-foreground">
              {doneCount} dari {SLOT_ORDER.length} selesai
            </span>
          ) : null}
          <Link
            href="/perjalanan-harian"
            className="flex items-center gap-1 text-xs font-medium text-primary transition-colors hover:text-primary/80"
          >
            Buka
            <ArrowRight className="h-3 w-3" aria-hidden />
          </Link>
        </div>
      </div>

      <Card className="border-langit-100 bg-langit-50/40">
        <CardContent className="space-y-4 p-5">
          {status === "loading" || status === "idle" ? (
            <div className="flex items-center gap-5">
              <Skeleton className="h-20 w-20 shrink-0 rounded-full" />
              <div className="flex-1 space-y-2.5">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          ) : status === "error" || !day ? (
            <p className="text-sm text-muted-foreground">
              {error ?? "Perjalanan hari ini belum bisa dimuat. Coba buka kembali halaman ini."}
            </p>
          ) : (
            <div className="flex items-center gap-5">
              <ProgressRing percent={percent} />

              <ul className="min-w-0 flex-1 space-y-2">
                {SLOT_ORDER.map((slot) => {
                  const item = day.items[slot];
                  const done = day.completion[slot];

                  return (
                    <li key={slot} className="flex items-center gap-2.5 text-sm">
                      <button
                        type="button"
                        onClick={() => setSlotComplete(slot, !done)}
                        aria-pressed={done}
                        aria-label={`Tandai ${SLOT_LABELS[slot]} ${done ? "belum" : "sudah"} selesai`}
                        className={cn(
                          "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors",
                          done
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border text-transparent hover:border-primary/50"
                        )}
                      >
                        <Check className="h-3 w-3" strokeWidth={3} />
                      </button>

                      <span className="min-w-0 flex-1 truncate">
                        <span className="font-medium text-foreground">{SLOT_LABELS[slot]}</span>
                        <span className="text-muted-foreground"> — {item.title}</span>
                      </span>

                      {slot === "artikel" ? (
                        <Link
                          href={`/library/${item.slug}`}
                          aria-label={`Baca ${item.title}`}
                          className="shrink-0 text-muted-foreground transition-colors hover:text-primary"
                        >
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
