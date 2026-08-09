"use client";

import * as React from "react";

/**
 * Status koneksi browser (`navigator.onLine` + event `online`/`offline`).
 * Dipakai halaman Naniash AI untuk lencana 🟢 Online / 🔵 Offline dan untuk
 * memutuskan apakah `AiService` boleh mencoba Mode Online sama sekali.
 *
 * Catatan jujur: `navigator.onLine` hanya berarti "terhubung ke jaringan
 * lokal", bukan jaminan Netlify Function/Gemini benar-benar bisa dihubungi
 * (mis. Wi-Fi captive portal). Karena itu ini dipakai sebagai sinyal AWAL
 * saja — kegagalan `fetch` yang sesungguhnya tetap ditangani terpisah lewat
 * fallback ke Mode Offline di `GeminiProvider`/halaman chat, bukan hanya
 * mengandalkan flag ini.
 */
export function useOnlineStatus(): boolean {
  // Default `true` saat render pertama (termasuk SSR) supaya tidak sempat
  // mengedip ke status Offline sebelum efek di bawah sempat membaca nilai
  // asli dari `navigator.onLine`.
  const [isOnline, setIsOnline] = React.useState(true);

  React.useEffect(() => {
    if (typeof navigator === "undefined" || typeof navigator.onLine !== "boolean") return;

    setIsOnline(navigator.onLine);

    function handleOnline() {
      setIsOnline(true);
    }
    function handleOffline() {
      setIsOnline(false);
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOnline;
}
