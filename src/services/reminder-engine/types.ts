/**
 * Tipe bersama Reminder Engine. Diimpor dari sini (bukan didefinisikan
 * ulang di tiap file) supaya Settings Service (`@/lib/db`), Notification
 * Service, dan Reminder Service (`@/lib/db`) semuanya sepakat pada bentuk
 * data yang sama.
 */

/** Dua jenis reminder bawaan yang dikelola engine ini. */
export type ReminderKind = "doa" | "journal";

export interface ReminderEngineSettings {
  /** Jam pagi, format 24 jam "HH:mm" — jam bunyi reminder membaca doa. */
  morningTime: string;
  /** Jam malam, format 24 jam "HH:mm" — jam bunyi reminder menulis journal. */
  eveningTime: string;
  /** Aktif/nonaktifkan reminder membaca doa (berbunyi jam `morningTime`). */
  doaReminderEnabled: boolean;
  /** Aktif/nonaktifkan reminder menulis journal (berbunyi jam `eveningTime`). */
  journalReminderEnabled: boolean;
}

/**
 * Status dukungan & izin Notification API di browser saat ini.
 * `"unsupported"` — API tidak ada sama sekali (mis. beberapa browser
 * mobile lama/in-app webview). Reminder tetap berjalan & jadwal tetap
 * tersimpan, hanya saja tidak ada notifikasi visual yang ditampilkan.
 */
export type NotificationPermissionState = "unsupported" | "granted" | "denied" | "default";

/** Status gabungan satu jenis reminder — untuk ditampilkan ke pengguna (tanpa UI di sini, tapi bentuk datanya disiapkan untuk konsumen di kemudian hari). */
export interface ReminderEngineStatus {
  kind: ReminderKind;
  enabled: boolean;
  /** Jam "HH:mm" yang sedang berlaku untuk jenis ini. */
  time: string;
  /** ISO string kapan reminder ini berikutnya akan berbunyi, `null` bila nonaktif. */
  nextFireAt: string | null;
  /** ISO string kapan reminder ini terakhir kali benar-benar terpicu, `null` bila belum pernah. */
  lastFiredAt: string | null;
}
