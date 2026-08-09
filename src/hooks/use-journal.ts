"use client";

import * as React from "react";

import { dbEvents, isIndexedDbSupported, journalService } from "@/lib/db";
import { todayDateKey } from "@/lib/db/utils/id";
import type { JournalRecord } from "@/lib/db/models";

export type JournalStatus = "idle" | "loading" | "ready" | "error";

export interface SaveTodayInput {
  mood?: string | null;
  moodEmoji?: string | null;
  content?: string;
}

/**
 * Hook client untuk halaman & kartu Journal. Satu-satunya jembatan ke
 * `journalService` (yang di baliknya memakai IndexedDB store `journal`,
 * sudah dibuat sebelumnya) — tidak ada penyimpanan lain atau panggilan
 * server, sehingga seluruh data jurnal murni tersimpan di perangkat.
 *
 * Mendengarkan `dbEvents` store "journal" supaya daftar entri otomatis
 * segar setiap kali ada perubahan (dari komponen ini sendiri, atau dari
 * `JournalCard` di Home yang memakai service yang sama).
 */
export function useJournal() {
  const [entries, setEntries] = React.useState<JournalRecord[]>([]);
  const [status, setStatus] = React.useState<JournalStatus>("idle");
  const [error, setError] = React.useState<string | null>(null);

  const refresh = React.useCallback(async () => {
    if (!isIndexedDbSupported()) {
      setStatus("error");
      setError("Penyimpanan lokal (IndexedDB) tidak tersedia di perangkat/browser ini.");
      return;
    }
    setStatus((prev) => (prev === "ready" ? "ready" : "loading"));
    try {
      const list = await journalService.list();
      setEntries(list);
      setStatus("ready");
      setError(null);
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Gagal memuat jurnal.");
    }
  }, []);

  React.useEffect(() => {
    refresh();
    const unsubscribe = dbEvents.subscribe("journal", () => refresh());
    return unsubscribe;
  }, [refresh]);

  const today = todayDateKey();
  const todayEntry = React.useMemo(
    () => entries.find((entry) => entry.date === today) ?? null,
    [entries, today]
  );

  /** Upsert entri hari ini — dipakai Mood picker (instan) & Composer refleksi (via tombol Simpan). */
  const saveToday = React.useCallback(
    async (input: SaveTodayInput) => {
      if (todayEntry) {
        return journalService.update(todayEntry.id, input);
      }
      return journalService.create({
        date: today,
        content: input.content ?? "",
        mood: input.mood ?? null,
        moodEmoji: input.moodEmoji ?? null,
      });
    },
    [todayEntry, today]
  );

  const updateEntry = React.useCallback(
    (id: string, patch: SaveTodayInput & { date?: string }) => journalService.update(id, patch),
    []
  );

  const removeEntry = React.useCallback((id: string) => journalService.remove(id), []);

  const getByDate = React.useCallback(
    (date: string) => entries.filter((entry) => entry.date === date),
    [entries]
  );

  return {
    entries,
    status,
    error,
    today,
    todayEntry,
    refresh,
    saveToday,
    updateEntry,
    removeEntry,
    getByDate,
  };
}
