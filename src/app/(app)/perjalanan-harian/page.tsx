import type { Metadata } from "next";

import { DailyJourneyPageClient } from "@/components/daily-journey/daily-journey-page-client";

export const metadata: Metadata = {
  title: "Perjalanan Hari Ini — Hadiah dari Langit",
  description: "Ritual harian singkat: Doa, Dzikir, Afirmasi, dan Refleksi untuk Bunda.",
};

/**
 * Halaman Daily Journey (Prompt 23) — versi lengkap dari kartu "Perjalanan
 * Hari Ini" yang sudah ada di Home. Memakai Daily Journey Engine yang
 * sudah dibuat sebelumnya (`useDailyJourney` → `dailyJourneyService` →
 * IndexedDB store `dailyJourney`), tanpa engine atau database baru.
 */
export default function DailyJourneyPage() {
  return <DailyJourneyPageClient />;
}
