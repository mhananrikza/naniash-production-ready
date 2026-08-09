import type { DailyJourneyPools, DailyJourneySelectionIds, DailyJourneySlot } from "@/types/daily-journey";
import { DAILY_JOURNEY_SLOTS } from "@/types/daily-journey";

/**
 * Algoritma inti Daily Journey Engine.
 *
 * SENGAJA murni (pure) — tidak menyentuh `fs`, `IndexedDB`, `Date.now()`
 * langsung, atau modul lain di luar `@/types/daily-journey`. Semua input
 * (pool id, tanggal, pilihan hari sebelumnya) dipasok oleh pemanggil
 * (`@/lib/db/services/daily-journey.service.ts`), supaya algoritma ini bisa
 * diuji dan dipahami tanpa mock apa pun, sama seperti pemisahan
 * loader/normalize/engine di Content Engine (`@/services/content`).
 *
 * ---------------------------------------------------------------------------
 * RINGKASAN ALGORITMA
 * ---------------------------------------------------------------------------
 *
 * Tujuan: untuk setiap tanggal kalender, tentukan SATU id per slot (doa,
 * dzikir, afirmasi, artikel) dengan sifat:
 *
 *   1. Deterministik — tanggal yang sama selalu menghasilkan pilihan yang
 *      sama, di perangkat mana pun, tanpa perlu menyimpan "urutan acak"
 *      yang digenerate sebelumnya. Ini kunci untuk mendukung "pengguna
 *      absen beberapa hari lalu balik lagi" — sistem tinggal menghitung
 *      langsung untuk tanggal hari ini, tidak perlu memutar ulang hari-hari
 *      yang terlewat satu per satu.
 *   2. Tidak boleh sama dengan pilihan hari SEBELUMNYA (aturan "tidak boleh
 *      dua hari berturut-turut").
 *   3. Merata ke seluruh pool seiring waktu (bukan selalu memilih item
 *      pertama/terakhir).
 *
 * Langkah per slot:
 *
 *   a. Hash `"${tanggal}:${slot}"` (mis. `"2026-08-08:doa"`) jadi integer
 *      32-bit lewat fungsi hash string sederhana (varian DJB2). Tanggal
 *      DAN slot ikut di-hash supaya ke-4 slot pada tanggal yang sama tidak
 *      kebetulan jatuh ke index yang sama secara sistematis.
 *   b. `index = hash % panjangPool` -> index kandidat untuk hari ini.
 *   c. Bandingkan `pool[index]` dengan id yang terpilih di hari
 *      SEBELUMNYA (`excludeId`). Jika sama DAN pool punya lebih dari satu
 *      item, geser satu langkah (`(index + 1) % panjangPool`) — cukup
 *      sekali geser karena hanya ada satu id yang perlu dihindari.
 *
 * Dari mana `excludeId` (pilihan kemarin) didapat? Ada dua sumber,
 * ditentukan oleh pemanggil (lihat `resolveDailySelection`):
 *
 *   - Bila kemarin PERNAH digenerate & tersimpan di IndexedDB (kasus
 *     normal: pengguna buka app tiap hari) -> pakai id yang BENAR-BENAR
 *     tersimpan itu. Ini paling akurat karena mencerminkan apa yang
 *     sungguh-sungguh ditampilkan kemarin, termasuk bila pool berubah
 *     antara kemarin dan hari ini (artikel baru ditambah, dsb).
 *   - Bila TIDAK ada record kemarin (pengguna baru pertama kali pakai
 *     app, atau baru buka lagi setelah absen beberapa hari sehingga
 *     tanggal kemarin tidak pernah benar-benar dibuka) -> hitung
 *     "pilihan bayangan" (`computeShadowPick`): index deterministik untuk
 *     tanggal kemarin TANPA menerapkan aturan no-repeat. Ini sengaja tidak
 *     rekursif mundur ke hari-hari sebelumnya lagi (yang bisa berantai
 *     jauh ke belakang bila absen lama) — cukup satu langkah, karena
 *     tujuannya cuma memberi nilai "hindari ini" yang masuk akal untuk
 *     hari ini, bukan merekonstruksi riwayat penuh yang toh tidak pernah
 *     benar-benar ditampilkan ke siapa pun.
 *
 * Dengan begini, "lanjut berdasarkan tanggal" tidak butuh iterasi harian:
 * `resolveDailySelection` untuk tanggal T hanya butuh (opsional) record
 * tanggal T-1, dihitung dalam waktu konstan berapa pun lama absennya.
 */

// ---------------------------------------------------------------------------
// Helper tanggal — mandiri (tidak import dari `@/lib/db`) supaya modul ini
// tetap bisa dipakai di server maupun client tanpa bergantung layer lain.
// ---------------------------------------------------------------------------

/** Format `Date` (waktu lokal perangkat, BUKAN UTC) jadi kunci `YYYY-MM-DD`. */
export function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Kebalikan `formatDateKey` — jam disengaja 00:00 waktu lokal. */
export function parseDateKey(dateKey: string): Date {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year ?? 1970, (month || 1) - 1, day || 1);
}

/** Geser `dateKey` sebanyak `delta` hari (boleh negatif). */
export function addDays(dateKey: string, delta: number): string {
  const date = parseDateKey(dateKey);
  date.setDate(date.getDate() + delta);
  return formatDateKey(date);
}

export function previousDateKey(dateKey: string): string {
  return addDays(dateKey, -1);
}

// ---------------------------------------------------------------------------
// Hash deterministik — varian DJB2. Dipilih karena sederhana, tidak butuh
// dependency, dan distribusinya cukup merata untuk kebutuhan ini (bukan
// untuk kriptografi).
// ---------------------------------------------------------------------------

export function hashStringToUint32(input: string): number {
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    // hash * 33 + charCode, dijaga tetap unsigned 32-bit lewat `>>> 0`.
    hash = ((hash << 5) + hash + input.charCodeAt(i)) >>> 0;
  }
  return hash >>> 0;
}

/** Index kandidat (belum dicek aturan no-repeat) untuk satu tanggal+slot. */
export function pickDeterministicIndex(dateKey: string, slot: string, poolLength: number): number {
  if (poolLength <= 0) {
    throw new Error(`Pool untuk slot "${slot}" kosong — tidak ada materi yang bisa dipilih.`);
  }
  return hashStringToUint32(`${dateKey}:${slot}`) % poolLength;
}

/**
 * Pilih satu id dari `poolIds` untuk `dateKey`+`slot`, sambil menghindari
 * `excludeId` (biasanya id yang terpilih kemarin). Ini implementasi
 * langsung dari aturan "tidak boleh sama dua hari berturut-turut".
 *
 * Bila pool hanya berisi satu item, aturan no-repeat tidak mungkin
 * dipenuhi (tidak ada kandidat lain) — item itu tetap dikembalikan
 * apa adanya, karena memblokir seluruh Daily Journey hanya karena satu
 * kategori baru punya satu materi jelas lebih buruk daripada mengulang.
 */
export function selectDailyItemId(
  poolIds: readonly string[],
  dateKey: string,
  slot: string,
  excludeId: string | null
): string {
  const n = poolIds.length;
  if (n === 0) {
    throw new Error(`Pool untuk slot "${slot}" kosong — tidak ada materi yang bisa dipilih.`);
  }

  const index = pickDeterministicIndex(dateKey, slot, n);
  const candidate = poolIds[index]!;

  if (n === 1 || candidate !== excludeId) {
    return candidate;
  }

  // Tabrakan dengan pilihan kemarin & pool masih punya kandidat lain -> geser satu langkah.
  return poolIds[(index + 1) % n]!;
}

/**
 * Hitung "pilihan bayangan" untuk sebuah tanggal — index deterministik
 * TANPA aturan no-repeat — dipakai sebagai fallback `excludeId` saat tidak
 * ada record tersimpan untuk hari sebelumnya. Lihat penjelasan panjang di
 * atas untuk alasannya.
 */
export function computeShadowPick(poolIds: readonly string[], dateKey: string, slot: string): string {
  const index = pickDeterministicIndex(dateKey, slot, poolIds.length);
  return poolIds[index]!;
}

/**
 * Titik masuk utama algoritma: resolve pilihan ke-4 slot untuk satu
 * tanggal, sekali panggil.
 *
 * @param pools             Id konten per slot (lihat `buildDailyJourneyPools`).
 * @param dateKey            Tanggal yang mau di-resolve, format `YYYY-MM-DD`.
 * @param previousSelection  Pilihan yang BENAR-BENAR tersimpan untuk tanggal
 *                           kemarin (dari IndexedDB), atau `null` bila tidak
 *                           ada record untuk tanggal itu.
 */
export function resolveDailySelection(
  pools: DailyJourneyPools,
  dateKey: string,
  previousSelection: Partial<DailyJourneySelectionIds> | null
): DailyJourneySelectionIds {
  const yesterday = previousDateKey(dateKey);
  const result = {} as DailyJourneySelectionIds;

  for (const slot of DAILY_JOURNEY_SLOTS as DailyJourneySlot[]) {
    const poolIds = pools[slot];
    const excludeId = previousSelection?.[slot] ?? computeShadowPick(poolIds, yesterday, slot);
    result[slot] = selectDailyItemId(poolIds, dateKey, slot, excludeId);
  }

  return result;
}
