/**
 * Titik impor tunggal untuk bagian Reminder Engine yang TIDAK menyentuh
 * IndexedDB (murni & browser-only), sama seperti pola `@/services/content`
 * dan `@/services/daily-journey`.
 *
 * Ini berisi:
 * - `time.ts`           — perhitungan jadwal berikutnya (pure, tanpa I/O).
 * - `notification.service.ts` — Notification Service (wrapper Notification API).
 *
 * Dua bagian lain dari Reminder Engine SENGAJA tidak diekspor dari sini
 * karena keduanya butuh IndexedDB, jadi tinggal di `@/lib/db` alih-alih —
 * konsisten dengan pola "storage-wired logic tinggal di lib/db" di seluruh
 * proyek ini:
 * - Settings Service — `reminderSettingsService` di
 *   `src/lib/db/services/reminder-settings.service.ts`. Menyimpan
 *   `ReminderEngineSettings` (waktu pagi/malam, aktif/nonaktif tiap
 *   jenis) ke store `settings`.
 * - Reminder Service — `reminderEngineService` di
 *   `src/lib/db/services/reminder-engine.service.ts`. Orkestrator utama:
 *   membaca Settings Service, menghitung jadwal lewat `computeNextFireAt`
 *   di sini, menyimpannya ke store `reminderSchedule`, memasang
 *   `setTimeout`, lalu memicu Notification Service saat jatuh tempo.
 *
 * Pemakaian umum (di Client Component / hook, setelah mount):
 *
 * ```ts
 * import { reminderSettingsService, reminderEngineService } from "@/lib/db";
 *
 * await reminderSettingsService.update({ morningTime: "05:00" });
 * await reminderEngineService.start(); // pasang/segarkan jadwal
 * ```
 */

export { isValidTimeString, parseTimeString, computeNextFireAt, millisUntil } from "./time";
export { notificationService } from "./notification.service";

export type { ReminderKind, ReminderEngineSettings, NotificationPermissionState, ReminderEngineStatus } from "./types";
