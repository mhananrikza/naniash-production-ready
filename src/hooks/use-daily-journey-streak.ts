"use client";

import * as React from "react";

import { isIndexedDbSupported, dailyJourneyService } from "@/lib/db";
import { todayDateKey } from "@/lib/db/utils/id";

/**
 * Hitung "hari beruntun" Daily Journey — berapa hari kalender berturut-turut
 * keempat slot (doa/dzikir/afirmasi/artikel) sudah ditandai selesai.
 *
 * Data diambil dari `dailyJourneyService.getHistory` (IndexedDB, sudah ada
 * sejak Daily Journey Engine dibuat, lihat komentar "untuk statistik/streak
 * di UI nanti" di `daily-journey.service.ts`) — TIDAK ada store baru yang
 * dibuat di sini, murni membaca ulang data yang sudah tersimpan.
 *
 * Aturan hitung: mundur dari hari ini. Bila hari ini SUDAH selesai, hari
 * ini ikut dihitung lalu lanjut mundur. Bila hari ini BELUM selesai (masih
 * berjalan), hari ini tidak memutus rantai — hitung tetap mulai dari
 * kemarin, supaya Bunda yang belum sempat membuka app hari ini tidak
 * kehilangan streak-nya di tengah hari.
 */
export function useDailyJourneyStreak() {
  const [streak, setStreak] = React.useState(0);
  const [status, setStatus] = React.useState<"idle" | "loading" | "ready" | "error">("idle");

  const load = React.useCallback(async () => {
    if (!isIndexedDbSupported()) return;
    setStatus("loading");

    try {
      const today = new Date();
      const start = new Date(today);
      start.setDate(start.getDate() - 60);

      const history = await dailyJourneyService.getHistory(todayDateKey(start), todayDateKey(today));
      const completedDates = new Set(
        history.filter((record) => record.completedAt != null).map((record) => record.id)
      );

      let count = 0;
      const cursor = new Date(today);

      // Hari ini belum selesai -> jangan putus rantai, mulai hitung dari kemarin.
      if (!completedDates.has(todayDateKey(cursor))) {
        cursor.setDate(cursor.getDate() - 1);
      }

      while (completedDates.has(todayDateKey(cursor))) {
        count += 1;
        cursor.setDate(cursor.getDate() - 1);
      }

      setStreak(count);
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  return { streak, status, refresh: load };
}
