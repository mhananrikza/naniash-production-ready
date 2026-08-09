/**
 * Titik impor tunggal Daily Journey Engine (bagian algoritma murni).
 * Import selalu dari sini (`@/services/daily-journey`), sama seperti pola
 * `@/services/content`.
 *
 * Ini HANYA berisi algoritma pemilihan (pure, tanpa I/O). Penyimpanan
 * progres harian ada di `@/lib/db` (`dailyJourneyService`) — lihat
 * `src/lib/db/services/daily-journey.service.ts`, yang memakai fungsi di
 * sini untuk menghitung pilihan lalu menyimpannya ke IndexedDB.
 */
export {
  formatDateKey,
  parseDateKey,
  addDays,
  previousDateKey,
  hashStringToUint32,
  pickDeterministicIndex,
  selectDailyItemId,
  computeShadowPick,
  resolveDailySelection,
} from "./algorithm";

export { buildDailyJourneyPools } from "./pool";

export type {
  DailyJourneySlot,
  DailyJourneyPools,
  DailyJourneySelectionIds,
  DailyJourneyCompletion,
  DailyJourneyPoolItem,
  DailyJourneyPoolManifest,
  DailyJourneyDay,
} from "@/types/daily-journey";

export { DAILY_JOURNEY_SLOTS } from "@/types/daily-journey";
