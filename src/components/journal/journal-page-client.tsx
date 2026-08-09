"use client";

import * as React from "react";
import { Lock } from "lucide-react";

import { Naniash } from "@/components/naniash/naniash";
import { Reveal } from "@/components/ui/reveal";
import { Skeleton } from "@/components/ui/skeleton";
import { JournalTodayMoodCard } from "@/components/journal/journal-today-mood-card";
import { JournalComposerCard } from "@/components/journal/journal-composer-card";
import { JournalHistoryList } from "@/components/journal/journal-history-list";
import { JournalCalendar } from "@/components/journal/journal-calendar";
import { JournalEntryDialog } from "@/components/journal/journal-entry-dialog";
import { JournalEmptyState } from "@/components/journal/journal-empty-state";
import { formatJournalDateLong } from "@/config/journal";
import { useJournal } from "@/hooks/use-journal";
import type { JournalRecord } from "@/lib/db/models";

export function JournalPageClient() {
  const { entries, status, error, todayEntry, saveToday, updateEntry, removeEntry, getByDate } = useJournal();

  const [openEntry, setOpenEntry] = React.useState<JournalRecord | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [selectedDate, setSelectedDate] = React.useState<string | null>(null);

  const entryDates = React.useMemo(() => new Set(entries.map((entry) => entry.date)), [entries]);
  const selectedDateEntries = React.useMemo(
    () => (selectedDate ? getByDate(selectedDate) : []),
    [selectedDate, getByDate]
  );

  function handleOpenEntry(entry: JournalRecord) {
    setOpenEntry(entry);
    setDialogOpen(true);
  }

  const isLoading = status === "idle" || status === "loading";

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-center sm:text-left">
        <Naniash pose="journaling" size={72} className="shrink-0" />
        <div className="space-y-1">
          <h1 className="font-display text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            Journal Bunda
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Tempat kecil untuk menyimpan cerita hati.
          </p>
        </div>
      </div>

      <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground sm:justify-start">
        <Lock className="h-3.5 w-3.5 shrink-0" aria-hidden />
        Catatan Bunda tersimpan di perangkat ini, bukan di server.
      </p>

      {status === "error" ? (
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">
            {error ?? "Journal belum bisa dimuat. Coba buka kembali halaman ini."}
          </p>
        </div>
      ) : (
        <>
          {/* Today's Mood */}
          <Reveal index={0}>
            {isLoading ? (
              <Skeleton className="h-40 w-full rounded-xl" />
            ) : (
              <JournalTodayMoodCard mood={todayEntry?.mood ?? null} onSave={saveToday} />
            )}
          </Reveal>

          {/* Today's Reflection */}
          <Reveal index={1}>
            {isLoading ? (
              <Skeleton className="h-56 w-full rounded-xl" />
            ) : (
              <JournalComposerCard todayEntry={todayEntry} onSave={saveToday} />
            )}
          </Reveal>

          {/* Riwayat Journal */}
          <Reveal index={2} className="space-y-3">
            <h2 className="font-display text-base font-medium tracking-tight text-foreground">Riwayat Journal</h2>
            <JournalHistoryList entries={entries} loading={isLoading} onOpen={handleOpenEntry} />
          </Reveal>

          {/* Kalender */}
          <Reveal index={3} className="space-y-3">
            <h2 className="font-display text-base font-medium tracking-tight text-foreground">Kalender</h2>
            <JournalCalendar entryDates={entryDates} selectedDate={selectedDate} onSelectDate={setSelectedDate} />

            {selectedDate && (
              <div className="space-y-2.5">
                <p className="text-xs font-medium text-muted-foreground">{formatJournalDateLong(selectedDate)}</p>
                {selectedDateEntries.length === 0 ? (
                  <JournalEmptyState />
                ) : (
                  <JournalHistoryList entries={selectedDateEntries} loading={false} onOpen={handleOpenEntry} />
                )}
              </div>
            )}
          </Reveal>
        </>
      )}

      <JournalEntryDialog
        entry={openEntry}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={updateEntry}
        onDelete={removeEntry}
      />
    </div>
  );
}
