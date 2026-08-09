"use client";

import { Trophy, Check } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useChallenge } from "@/hooks/use-challenge";

/**
 * "Challenge 30 Hari" — dibaca & ditulis lewat `useChallenge`
 * (`challengeService`, IndexedDB). Challenge otomatis dimulai sekali saat
 * pertama kali Home dibuka (lihat hook), lalu progresnya murni dari
 * check-in asli, bukan angka contoh.
 */
export function ChallengeCard() {
  const { status, record, completedDays, totalDays, percent, isTodayCheckedIn, checkInToday, last7Days } =
    useChallenge();

  if (status === "loading" || status === "idle" || !record) {
    return (
      <Card className="border-cahaya-500/30 bg-cahaya-100/40 dark:bg-cahaya-700/5">
        <CardContent className="space-y-4 p-5">
          <div className="flex items-center gap-2.5">
            <Skeleton className="h-9 w-9 shrink-0 rounded-lg" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
          <Skeleton className="h-2 w-full rounded-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-cahaya-500/30 bg-cahaya-100/40 dark:bg-cahaya-700/5">
      <CardContent className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cahaya-500/20 text-cahaya-700">
              <Trophy className="h-4.5 w-4.5" strokeWidth={1.75} />
            </span>
            <div>
              <p className="font-display text-sm font-medium leading-tight text-foreground">
                Perjalanan 30 Hari
              </p>
              <p className="text-xs text-muted-foreground">
                {completedDays} / {totalDays} hari
              </p>
            </div>
          </div>
          <span className="shrink-0 font-display text-lg font-semibold text-cahaya-700">{percent}%</span>
        </div>

        <Progress value={percent} aria-label="Progres challenge 30 hari" indicatorClassName="bg-cahaya-500" />

        <div className="flex items-center justify-between gap-1.5">
          {last7Days.map((day) => (
            <div key={day.date} className="flex flex-1 flex-col items-center gap-1">
              <span
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-medium",
                  day.done
                    ? "bg-cahaya-500 text-nur-700"
                    : day.isToday
                      ? "border border-dashed border-cahaya-500 text-cahaya-700"
                      : "bg-background text-muted-foreground/70"
                )}
              >
                {day.done ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : day.label}
              </span>
            </div>
          ))}
        </div>

        <Button
          size="sm"
          onClick={checkInToday}
          className={cn(
            "w-full",
            isTodayCheckedIn
              ? "bg-cahaya-100 text-cahaya-700 hover:bg-cahaya-100/80"
              : "bg-cahaya-500 text-nur-700 hover:bg-cahaya-500/90"
          )}
        >
          {isTodayCheckedIn ? "Hari Ini Sudah Dicentang ✓" : "Lanjutkan Challenge"}
        </Button>
      </CardContent>
    </Card>
  );
}
