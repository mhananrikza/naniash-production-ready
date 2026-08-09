"use client";

import * as React from "react";

/**
 * Hook localStorage generik. Mulai dari `initialValue` di render pertama
 * (sama di server & client) supaya tidak terjadi hydration mismatch, lalu
 * membaca nilai tersimpan lewat `useEffect` setelah mount.
 *
 * `hydrated` berguna untuk komponen yang perlu menunggu nilai asli
 * ter-load sebelum menghitung turunan (mis. daftar "Lanjutkan Membaca").
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): readonly [T, React.Dispatch<React.SetStateAction<T>>, boolean] {
  const [value, setValue] = React.useState<T>(initialValue);
  const [hydrated, setHydrated] = React.useState(false);

  React.useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw !== null) {
        setValue(JSON.parse(raw) as T);
      }
    } catch {
      // Abaikan — kembali ke initialValue bila data korup/tidak tersedia.
    } finally {
      setHydrated(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  React.useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Abaikan error kuota/mode privat — data tetap jalan di memori.
    }
  }, [key, value, hydrated]);

  return [value, setValue, hydrated] as const;
}
