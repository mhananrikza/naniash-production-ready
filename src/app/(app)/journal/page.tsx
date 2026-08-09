import type { Metadata } from "next";

import { JournalPageClient } from "@/components/journal/journal-page-client";

export const metadata: Metadata = {
  title: "Journal Bunda — Hadiah dari Langit",
  description: "Tempat kecil untuk menyimpan rasa syukur, perasaan, refleksi, dan catatan perjalanan Bunda.",
};

/**
 * Halaman Journal (Prompt 24). Memakai Journal Service yang sudah ada
 * (`journalService` → IndexedDB store `journal`, lihat
 * `src/lib/db/services/journal.service.ts`) lewat hook `useJournal` —
 * tidak ada engine atau database baru. Seluruh data tersimpan di
 * perangkat, tidak pernah dikirim ke server mana pun.
 */
export default function JournalPage() {
  return <JournalPageClient />;
}
