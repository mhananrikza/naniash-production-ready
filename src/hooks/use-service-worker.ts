"use client";

import * as React from "react";

export type ServiceWorkerStatus = "idle" | "registered" | "update-available" | "unsupported";

/**
 * Mendaftarkan `/sw.js` (hasil build `next-pwa`, lihat `next.config.mjs`
 * — `register: false` di sana supaya pendaftaran dikontrol manual dari
 * sini) dan memantau siklus hidupnya.
 *
 * Kenapa manual, bukan `register: true` bawaan next-pwa?
 * - Supaya kita bisa mendeteksi kapan versi SW baru sudah terpasang dan
 *   menunggu (`installing` -> `waiting`), lalu menawarkan ke pengguna
 *   untuk memuat ulang — bukan mengganti aset diam-diam di tengah sesi
 *   (mis. saat Bunda sedang menulis jurnal).
 * - `skipWaiting: true` tetap diaktifkan di config sebagai jaring
 *   pengaman (worker lama tidak "nyangkut"), tapi reload halaman tetap
 *   kita picu terkendali lewat `controllerchange`, bukan otomatis.
 */
export function useServiceWorker() {
  const [status, setStatus] = React.useState<ServiceWorkerStatus>("idle");
  const waitingWorkerRef = React.useRef<ServiceWorker | null>(null);
  const reloadedOnceRef = React.useRef(false);

  const activateUpdate = React.useCallback(() => {
    waitingWorkerRef.current?.postMessage({ type: "SKIP_WAITING" });
  }, []);

  React.useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      setStatus("unsupported");
      return;
    }

    // Hanya aktif pada build production (next-pwa men-skip generate SW di
    // development, jadi /sw.js tidak akan ada saat `npm run dev`).
    if (process.env.NODE_ENV !== "production") {
      return;
    }

    let cancelled = false;

    async function register() {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
        if (cancelled) return;
        setStatus("registered");

        // Sudah ada worker baru yang menunggu (mis. tab lain baru saja
        // memicu update) sebelum listener di bawah sempat terpasang.
        if (registration.waiting) {
          waitingWorkerRef.current = registration.waiting;
          setStatus("update-available");
        }

        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          if (!newWorker) return;

          newWorker.addEventListener("statechange", () => {
            if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
              waitingWorkerRef.current = newWorker;
              setStatus("update-available");
            }
          });
        });
      } catch {
        // Registrasi gagal (mis. lingkungan tanpa HTTPS) — aplikasi tetap
        // jalan normal, hanya tanpa kemampuan offline.
      }
    }

    register();

    function handleControllerChange() {
      // SW baru sudah mengambil alih kontrol halaman ini. Reload sekali
      // supaya semua chunk yang sedang jalan konsisten dengan cache versi
      // baru — dijaga dengan flag agar tidak looping.
      if (reloadedOnceRef.current) return;
      reloadedOnceRef.current = true;
      window.location.reload();
    }

    navigator.serviceWorker.addEventListener("controllerchange", handleControllerChange);

    return () => {
      cancelled = true;
      navigator.serviceWorker.removeEventListener("controllerchange", handleControllerChange);
    };
  }, []);

  return { status, activateUpdate } as const;
}
