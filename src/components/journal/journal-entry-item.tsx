"use client";

import { ChevronRight } from "lucide-react";

import { formatJournalDateShort } from "@/config/journal";
import type { JournalRecord } from "@/lib/db/models";

export interface JournalEntryItemProps {
  entry: JournalRecord;
  onOpen: (entry: JournalRecord) => void;
}

/** Ringkas konten jadi satu baris preview, tanpa memotong di tengah kata bila memungkinkan. */
function previewOf(content: string, max = 90): string {
  const trimmed = content.trim();
  if (trimmed.length === 0) return "Belum ada catatan — hanya mood yang tersimpan.";
  if (trimmed.length <= max) return trimmed;
  const cut = trimmed.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return `${cut.slice(0, lastSpace > 40 ? lastSpace : max)}…`;
}

export function JournalEntryItem({ entry, onOpen }: JournalEntryItemProps) {
  return (
    <button
      type="button"
      onClick={() => onOpen(entry)}
      className="flex w-full items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-left shadow-sm transition-colors hover:border-primary/40 hover:bg-muted/50"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-lg" aria-hidden>
        {entry.moodEmoji ?? "📝"}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center justify-between gap-2">
          <span className="text-xs font-medium text-muted-foreground">
            {formatJournalDateShort(entry.date)}
          </span>
          {entry.mood && (
            <span className="shrink-0 text-xs font-medium text-primary">{entry.mood}</span>
          )}
        </span>
        <span className="mt-0.5 block truncate text-sm text-foreground">{previewOf(entry.content)}</span>
      </span>
      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
    </button>
  );
}
