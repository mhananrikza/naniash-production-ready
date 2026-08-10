"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { DailyJourneyPoolItem, DailyJourneySlot } from "@/types/daily-journey";

export interface JourneyActivityCardProps {
  slot: DailyJourneySlot;
  icon: LucideIcon;
  label: string;
  item: DailyJourneyPoolItem;
  done: boolean;
}

/**
 * Satu kartu aktivitas Daily Journey (Doa / Dzikir / Afirmasi). Menekan
 * "Mulai" membuka Content Reader universal (`/content/[slug]`) dengan
 * penanda `?from=daily-journey&slot=...` — Content Reader (Prompt 22)
 * sendiri yang menandai slot ini selesai lewat Daily Journey Engine begitu
 * Bunda menekan "Tandai Selesai" di sana, lalu kembali ke halaman ini.
 * Tidak ada engine atau store baru: status `done` murni dibaca dari
 * `useDailyJourney` (IndexedDB store `dailyJourney`, sudah ada).
 */
export function JourneyActivityCard({ slot, icon: Icon, label, item, done }: JourneyActivityCardProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <Card
      className={cn(
        "overflow-hidden transition-colors",
        done ? "border-primary/40 bg-primary/5" : "border-langit-100 bg-langit-50/40"
      )}
    >
      <CardContent className="flex items-center gap-4 p-5">
        <motion.div
          className={cn(
            "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl",
            done ? "bg-primary/15 text-primary" : "bg-langit-100 text-langit-700"
          )}
          animate={done && !prefersReducedMotion ? { scale: [1, 1.12, 1] } : undefined}
          transition={{ duration: 0.4, ease: "easeOut" }}
          aria-hidden
        >
          <Icon className="h-6 w-6" strokeWidth={1.75} />
        </motion.div>

        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="font-display text-base font-medium tracking-tight text-foreground">
              {label}
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
          <p className="truncate text-sm text-muted-foreground">{item.title}</p>
        </div>

        <Link
          href={`/content/${item.slug}?from=daily-journey&slot=${slot}`}
          className={cn(
            "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
            done
              ? "border border-border text-muted-foreground hover:bg-muted"
              : "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
          )}
        >
          {done ? "Baca Lagi" : "Mulai"}
        </Link>
      </CardContent>
    </Card>
  );
}
