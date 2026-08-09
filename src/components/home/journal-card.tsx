"use client";

import * as React from "react";
import Link from "next/link";
import { NotebookPen } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { isIndexedDbSupported, journalService } from "@/lib/db";
import { journalContent } from "@/config/home";

export function JournalCard() {
  const [selectedMood, setSelectedMood] = React.useState<string | null>(null);
  // Streak jurnal dihitung dari entri asli di IndexedDB (`journalService.getStreak`),
  // bukan angka contoh — hanya prompt & pilihan mood yang masih copy statis
  // sampai halaman tulis jurnal dibuat di prompt berikutnya.
  const [streakDays, setStreakDays] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (!isIndexedDbSupported()) return;
    let cancelled = false;
    journalService.getStreak().then((value) => {
      if (!cancelled) setStreakDays(value);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Card>
      <CardContent className="space-y-4 p-5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-nur-500/10 text-nur-500">
              <NotebookPen className="h-4.5 w-4.5" strokeWidth={1.75} />
            </span>
            <h2 className="font-display text-base font-medium tracking-tight text-foreground">
              Journal
            </h2>
          </div>
          <span className="text-xs font-medium text-muted-foreground">
            {streakDays ?? 0} hari beruntun ✍️
          </span>
        </div>

        <p className="text-sm leading-relaxed text-foreground">{journalContent.prompt}</p>

        <div className="flex flex-wrap gap-2">
          {journalContent.moods.map((mood) => {
            const isActive = selectedMood === mood.label;
            return (
              <button
                key={mood.label}
                type="button"
                onClick={() => setSelectedMood(mood.label)}
                aria-pressed={isActive}
                className={cn(
                  "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors",
                  isActive
                    ? "border-primary bg-primary/15 text-primary"
                    : "border-border text-muted-foreground hover:bg-muted"
                )}
              >
                <span aria-hidden>{mood.emoji}</span>
                {mood.label}
              </button>
            );
          })}
        </div>

        <Button variant="secondary" size="sm" className="w-full" asChild>
          <Link href="/journal">Tulis jurnal hari ini</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
