"use client";

import * as React from "react";

import { isIndexedDbSupported, dailyJourneyService } from "@/lib/db";
import { buildDailyJourneyPools } from "@/services/daily-journey";
import type {
  DailyJourneyDay,
  DailyJourneyPoolItem,
  DailyJourneyPoolManifest,
  DailyJourneySlot,
} from "@/types/daily-journey";

/**
 * Hook client untuk Daily Journey Engine. BELUM dipasang ke komponen UI
 * mana pun (lihat instruksi tugas) — disiapkan agar `<DailyJourneyCard />`
 * atau halaman lain tinggal memanggil ini begitu siap ditampilkan.
 *
 * Alur kerja tiap mount:
 *   1. Fetch manifest statis `/daily-journey-pool.json` (dihasilkan saat
 *      build oleh `scripts/generate-daily-journey-pool.mjs`, ikut
 *      di-precache service worker — lihat `next.config.mjs`).
 *   2. Bangun pool id per slot (`buildDailyJourneyPools`).
 *   3. Minta materi hari ini ke `dailyJourneyService.getToday`, yang akan
 *      generate baru (dan menyimpannya) bila tanggal hari ini belum
 *      pernah di-generate, atau mengembalikan materi tersimpan bila
 *      sudah — lihat penjelasan lengkap algoritmanya di
 *      `@/services/daily-journey/algorithm.ts` dan
 *      `@/lib/db/services/daily-journey.service.ts`.
 *   4. Cocokkan id yang terpilih ke item manifest penuh untuk ditampilkan.
 */

type DailyJourneyStatus = "idle" | "loading" | "ready" | "error";

interface UseDailyJourneyState {
  status: DailyJourneyStatus;
  day: DailyJourneyDay | null;
  error: string | null;
}

function toDay(
  itemIds: Record<DailyJourneySlot, string>,
  completion: DailyJourneyDay["completion"],
  generatedAt: string,
  completedAt: string | null,
  date: string,
  itemsById: Map<string, DailyJourneyPoolItem>
): DailyJourneyDay | null {
  const items = {} as DailyJourneyDay["items"];

  for (const slot of Object.keys(itemIds) as DailyJourneySlot[]) {
    const item = itemsById.get(itemIds[slot]);
    // Bisa terjadi bila pool berubah drastis (mis. materi dihapus) setelah
    // record hari ini pernah tersimpan — daripada crash, batalkan render
    // hari ini dan biarkan pemanggil menampilkan status error yang jelas.
    if (!item) return null;
    items[slot] = item;
  }

  return {
    date,
    items,
    completion,
    isCompleted: completedAt != null,
    generatedAt,
    completedAt,
  };
}

export function useDailyJourney() {
  const [state, setState] = React.useState<UseDailyJourneyState>({
    status: "idle",
    day: null,
    error: null,
  });
  const itemsByIdRef = React.useRef<Map<string, DailyJourneyPoolItem>>(new Map());

  const load = React.useCallback(async () => {
    if (!isIndexedDbSupported()) return;
    setState({ status: "loading", day: null, error: null });

    try {
      const response = await fetch("/daily-journey-pool.json");
      if (!response.ok) throw new Error("Gagal memuat data Daily Journey.");

      const manifest: DailyJourneyPoolManifest = await response.json();
      const itemsById = new Map(manifest.items.map((item) => [item.id, item] as const));
      itemsByIdRef.current = itemsById;

      const pools = buildDailyJourneyPools(manifest.items);
      const record = await dailyJourneyService.getToday(pools);
      const day = toDay(
        record.itemIds,
        record.completion,
        record.generatedAt,
        record.completedAt,
        record.id,
        itemsById
      );

      if (!day) throw new Error("Materi hari ini tidak ditemukan di manifest.");
      setState({ status: "ready", day, error: null });
    } catch (error) {
      setState({
        status: "error",
        day: null,
        error: error instanceof Error ? error.message : "Gagal memuat Daily Journey.",
      });
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  /** Tandai satu slot selesai/belum untuk hari ini, lalu perbarui state lokal. */
  const setSlotComplete = React.useCallback(async (slot: DailyJourneySlot, done: boolean) => {
    const record = await dailyJourneyService.setSlotComplete(slot, done);
    const day = toDay(
      record.itemIds,
      record.completion,
      record.generatedAt,
      record.completedAt,
      record.id,
      itemsByIdRef.current
    );
    if (day) setState((prev) => ({ ...prev, day }));
  }, []);

  return { ...state, setSlotComplete, refresh: load };
}
