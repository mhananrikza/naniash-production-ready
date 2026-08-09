/**
 * Helper waktu MURNI untuk Reminder Engine — tidak menyentuh IndexedDB,
 * Notification API, atau `setTimeout`. Satu-satunya efek samping implisit
 * yang diizinkan adalah parameter default `from = new Date()` di
 * `computeNextFireAt`, supaya pemanggil boleh menyuntikkan waktu tetap
 * saat perlu menguji fungsi ini secara deterministik.
 *
 * Sengaja dipisah dari `reminder-engine.service.ts` (yang menyimpan ke
 * IndexedDB & memicu `setTimeout`), sama seperti pemisahan
 * algorithm/service di Daily Journey Engine (`@/services/daily-journey`).
 */

const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

/** `true` bila `value` berformat 24 jam "HH:mm" yang valid, mis. "05:00" atau "20:30". */
export function isValidTimeString(value: string): boolean {
  return TIME_PATTERN.test(value);
}

interface ParsedTime {
  hour: number;
  minute: number;
}

/** Pecah "HH:mm" jadi jam & menit numerik. Melempar bila formatnya tidak valid. */
export function parseTimeString(value: string): ParsedTime {
  const match = TIME_PATTERN.exec(value);
  if (!match) {
    throw new Error(`Format waktu tidak valid: "${value}". Gunakan format 24 jam "HH:mm", mis. "05:00".`);
  }
  return { hour: Number(match[1]), minute: Number(match[2]) };
}

/**
 * Hitung waktu terjadinya BERIKUTNYA untuk jam "HH:mm" tertentu, relatif
 * ke `from`. Bila jam tsb pada hari `from` sudah lewat (atau persis sama),
 * hasilnya digeser ke hari berikutnya — reminder harian selalu berarti
 * "kejadian berikutnya", tidak pernah waktu yang sudah lewat.
 */
export function computeNextFireAt(time: string, from: Date = new Date()): Date {
  const { hour, minute } = parseTimeString(time);
  const next = new Date(from.getFullYear(), from.getMonth(), from.getDate(), hour, minute, 0, 0);
  if (next.getTime() <= from.getTime()) {
    next.setDate(next.getDate() + 1);
  }
  return next;
}

/** Jarak dalam milidetik dari `from` (default sekarang) ke `target`, tidak pernah negatif. */
export function millisUntil(target: Date, from: Date = new Date()): number {
  return Math.max(0, target.getTime() - from.getTime());
}
