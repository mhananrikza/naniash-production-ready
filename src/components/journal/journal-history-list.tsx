"use client";

import { JournalEntryItem } from "@/components/journal/journal-entry-item";
import { JournalEmptyState } from "@/components/journal/journal-empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import type { JournalRecord } from "@/lib/db/models";

export interface JournalHistoryListProps {
  entries: JournalRecord[];
  loading: boolean;
  onOpen: (entry: JournalRecord) => void;
  /** Batasi jumlah yang ditampilkan (mis. di halaman utama sebelum "lihat semua"). */
  limit?: number;
}

export function JournalHistoryList({ entries, loading, onOpen, limit }: JournalHistoryListProps) {
  if (loading) {
    return (
      <div className="space-y-2.5">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (entries.length === 0) {
    return <JournalEmptyState />;
  }

  const visible = typeof limit === "number" ? entries.slice(0, limit) : entries;

  return (
    <div className="space-y-2.5">
      {visible.map((entry) => (
        <JournalEntryItem key={entry.id} entry={entry} onOpen={onOpen} />
      ))}
    </div>
  );
}
