export interface JournalMoodOption {
  emoji: string;
  label: string;
}

/**
 * Enam pilihan mood untuk halaman Journal penuh (Prompt 24). Sengaja
 * dipisah dari `journalContent.moods` di `config/home.ts` — kartu Home
 * masih memakai 4 mood ringkas untuk sekilas pandang, sedangkan halaman
 * Journal memakai set lengkap sesuai spesifikasi.
 */
export const JOURNAL_MOODS: JournalMoodOption[] = [
  { emoji: "😊", label: "Bahagia" },
  { emoji: "😌", label: "Tenang" },
  { emoji: "😔", label: "Sedih" },
  { emoji: "😩", label: "Lelah" },
  { emoji: "🥰", label: "Bersyukur" },
  { emoji: "😟", label: "Cemas" },
];

export function findMoodByLabel(label: string | null | undefined): JournalMoodOption | undefined {
  if (!label) return undefined;
  return JOURNAL_MOODS.find((mood) => mood.label === label);
}

/** Format tanggal panjang berbahasa Indonesia, mis. "Jumat, 8 Agustus 2026". */
export function formatJournalDateLong(dateKey: string): string {
  const date = parseDateKey(dateKey);
  return date.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** Format tanggal singkat, mis. "8 Agu 2026". */
export function formatJournalDateShort(dateKey: string): string {
  const date = parseDateKey(dateKey);
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Parse kunci `YYYY-MM-DD` sebagai tanggal lokal (bukan UTC) supaya konsisten dengan `todayDateKey`. */
export function parseDateKey(dateKey: string): Date {
  const parts = dateKey.split("-").map(Number);
  const year = parts[0] ?? new Date().getFullYear();
  const month = parts[1] ?? 1;
  const day = parts[2] ?? 1;
  return new Date(year, month - 1, day);
}
