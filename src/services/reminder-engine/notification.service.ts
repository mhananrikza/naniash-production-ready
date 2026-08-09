import type { NotificationPermissionState } from "./types";

/**
 * Notification Service — Reminder Engine.
 *
 * Satu-satunya modul yang boleh menyentuh `window.Notification` /
 * `ServiceWorkerRegistration.showNotification` secara langsung. Tidak
 * tahu apa pun soal jadwal, IndexedDB, atau `setTimeout` — hanya
 * membungkus "apakah didukung", "apa izinnya", "minta izin", dan
 * "tampilkan satu notifikasi".
 *
 * Dipanggil oleh Reminder Service (`@/lib/db` — `reminder-engine.service.ts`)
 * saat sebuah jadwal jatuh tempo. Bila browser TIDAK mendukung Notification
 * API sama sekali, `show()` cukup mengembalikan `false` tanpa melempar —
 * pemanggil tetap menyimpan jadwalnya, hanya saja tidak ada notifikasi
 * visual yang muncul (sesuai kebutuhan: reminder tetap "berjalan" walau
 * tanpa notifikasi).
 */
export const notificationService = {
  /** `true` bila `Notification` tersedia di lingkungan (browser) saat ini. */
  isSupported(): boolean {
    return typeof window !== "undefined" && "Notification" in window;
  },

  /** Status izin saat ini TANPA memicu prompt. */
  getPermission(): NotificationPermissionState {
    if (!notificationService.isSupported()) return "unsupported";
    return Notification.permission;
  },

  /**
   * Minta izin ke pengguna bila statusnya masih `"default"` (belum pernah
   * ditanya/ditolak/diterima). Aman dipanggil berkali-kali — tidak
   * memunculkan prompt berulang bila sudah `"granted"`/`"denied"`.
   */
  async requestPermission(): Promise<NotificationPermissionState> {
    if (!notificationService.isSupported()) return "unsupported";
    if (Notification.permission !== "default") return Notification.permission;

    try {
      return await Notification.requestPermission();
    } catch {
      // Beberapa browser lama pakai signature callback, bukan Promise —
      // pada kasus itu `Notification.permission` tetap sumber kebenaran.
      return Notification.permission;
    }
  },

  /**
   * Tampilkan satu notifikasi lokal. Mengembalikan `false` (tanpa
   * melempar) bila tidak didukung atau izin belum/tidak diberikan —
   * pemanggil cukup memperlakukannya sebagai "notifikasi tidak tampil",
   * bukan error yang menghentikan jadwal.
   *
   * Lewat service worker (`showNotification`) bila ada registrasi aktif,
   * supaya notifikasi tetap tampil walau tab sedang tidak fokus; jatuh ke
   * `new Notification(...)` biasa bila tidak ada service worker terdaftar.
   */
  async show(title: string, options?: NotificationOptions): Promise<boolean> {
    if (!notificationService.isSupported() || Notification.permission !== "granted") {
      return false;
    }

    try {
      if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          await registration.showNotification(title, options);
          return true;
        }
      }
      // eslint-disable-next-line no-new -- notifikasi ditampilkan lewat efek samping constructor, bukan nilai baliknya.
      new Notification(title, options);
      return true;
    } catch {
      // Lingkungan menolak menampilkan notifikasi (mis. dibatasi OS/browser
      // di luar kendali kita) — bukan hal fatal bagi Reminder Service.
      return false;
    }
  },
};
