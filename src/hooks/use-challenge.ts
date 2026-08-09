"use client";

import * as React from "react";

import { isIndexedDbSupported, challengeService } from "@/lib/db";
import { todayDateKey } from "@/lib/db/utils/id";
import type { ChallengeRecord } from "@/lib/db/models";

/** Satu challenge bawaan aktif di Home. Bisa jadi daftar bila nanti ada lebih dari satu. */
export const DEFAULT_CHALLENGE_ID = "30-hari-doa-konsisten";
const DEFAULT_CHALLENGE_TITLE = "Challenge 30 Hari Doa Konsisten";
const DEFAULT_TOTAL_DAYS = 30;

type ChallengeStatus = "idle" | "loading" | "ready" | "error";

/**
 * Hook client untuk kartu "Challenge 30 Hari" di Home. Berbeda dari Daily
 * Journey Engine (yang materinya digenerate otomatis), challenge di sini
 * cukup sederhana: dibuat sekali (auto-start) saat pertama kali Home
 * dibuka, lalu Bunda check-in manual per hari lewat `challengeService`
 * (store `challenge` di IndexedDB, sudah ada — lihat `challenge.service.ts`).
 */
export function useChallenge(
  id: string = DEFAULT_CHALLENGE_ID,
  title: string = DEFAULT_CHALLENGE_TITLE,
  totalDays: number = DEFAULT_TOTAL_DAYS
) {
  const [record, setRecord] = React.useState<ChallengeRecord | null>(null);
  const [status, setStatus] = React.useState<ChallengeStatus>("idle");

  const load = React.useCallback(async () => {
    if (!isIndexedDbSupported()) return;
    setStatus("loading");

    try {
      const existing = await challengeService.get(id);
      const resolved = existing ?? (await challengeService.start({ id, title, totalDays }));
      setRecord(resolved);
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, [id, title, totalDays]);

  React.useEffect(() => {
    load();
  }, [load]);

  const isTodayCheckedIn = record?.checkIns[todayDateKey()] ?? false;

  const checkInToday = React.useCallback(async () => {
    const updated = await challengeService.checkIn(id, todayDateKey(), !isTodayCheckedIn);
    setRecord(updated);
  }, [id, isTodayCheckedIn]);

  const completedDays = record ? Object.values(record.checkIns).filter(Boolean).length : 0;
  const percent = record ? challengeService.getProgressPercent(record) : 0;

  /** 7 hari terakhir (termasuk hari ini) untuk strip mingguan — dibaca dari check-in asli. */
  const last7Days = React.useMemo(() => {
    const days: { date: string; label: string; done: boolean; isToday: boolean }[] = [];
    const dayLabels: Record<number, string> = { 0: "M", 1: "S", 2: "S", 3: "R", 4: "K", 5: "J", 6: "S" }; // getDay(): 0=Minggu

    for (let i = 6; i >= 0; i -= 1) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = todayDateKey(d);
      days.push({
        date: key,
        label: dayLabels[d.getDay()] ?? "",
        done: record?.checkIns[key] ?? false,
        isToday: i === 0,
      });
    }
    return days;
  }, [record]);

  return {
    record,
    status,
    completedDays,
    totalDays,
    percent,
    isTodayCheckedIn,
    checkInToday,
    last7Days,
    refresh: load,
  };
}
