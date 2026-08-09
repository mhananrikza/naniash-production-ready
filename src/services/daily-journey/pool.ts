import type { DailyJourneyPools, DailyJourneySlot } from "@/types/daily-journey";

/**
 * Bangun pool id per slot dari daftar item konten (id + type saja yang
 * dibutuhkan — cocok dipakai baik dengan `ContentItemMeta` dari Content
 * Engine di server, maupun `DailyJourneyPoolItem` dari manifest statis di
 * client).
 *
 * Diurutkan stabil berdasarkan `id` (BUKAN `publishedAt`/urutan file di
 * disk) supaya index yang dihasilkan `pickDeterministicIndex` konsisten
 * dari hari ke hari — kalau urutan pool berubah-ubah tanpa alasan (mis.
 * ada dua file dengan `publishedAt` sama lalu urutan `readdirSync`
 * berbeda antar OS), index yang sama bisa menunjuk ke item yang berbeda,
 * merusak determinisme algoritma.
 */
export function buildDailyJourneyPools(
  items: readonly { id: string; type: DailyJourneySlot }[]
): DailyJourneyPools {
  const pools: DailyJourneyPools = { doa: [], dzikir: [], afirmasi: [], artikel: [] };

  for (const item of items) {
    pools[item.type].push(item.id);
  }

  (Object.keys(pools) as DailyJourneySlot[]).forEach((slot) => {
    pools[slot].sort();
  });

  return pools;
}
