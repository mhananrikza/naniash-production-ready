"use client";

import { useSearchIndex } from "@/hooks/use-search-index";

/**
 * Tidak me-render apa pun — hanya memicu `useSearchIndex()` supaya index
 * Search Engine lokal (IndexedDB) sudah siap SEBELUM pengguna sempat
 * mengetik query pertamanya. Dipasang sekali di `Providers`, sama seperti
 * `<ServiceWorkerRegister />`.
 *
 * Ini BUKAN komponen UI pencarian (tidak ada input/kotak pencarian di
 * sini) — murni bootstrap data layer. UI pencarian (kalau nanti dibuat)
 * tinggal memanggil `searchService.search(...)` dari mana saja, index-nya
 * sudah tersedia berkat komponen ini.
 */
export function SearchIndexInitializer() {
  useSearchIndex();
  return null;
}
