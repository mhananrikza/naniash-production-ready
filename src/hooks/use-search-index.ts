"use client";

import * as React from "react";

import { isIndexedDbSupported, searchService, type SearchIndexStatus } from "@/lib/db";

/**
 * Memastikan index Search Engine lokal (lihat `@/lib/db/services/search`)
 * siap dipakai — dipanggil sekali saat komponen pemakainya mount (lihat
 * `<SearchIndexInitializer />`, dipasang global di `Providers`).
 *
 * Membangun index butuh fetch `search-data.json` + tokenize seluruh
 * dokumen, jadi dilakukan di `useEffect` (bukan render), dan aman
 * dipanggil berkali-kali — `ensureIndexReady()` sendiri sudah
 * dedupe pemanggilan bersamaan (lihat `search-index.service.ts`).
 */
export function useSearchIndex() {
  const [status, setStatus] = React.useState<SearchIndexStatus>({ state: "empty" });

  React.useEffect(() => {
    if (!isIndexedDbSupported()) return;

    let cancelled = false;
    setStatus({ state: "building" });

    searchService.ensureIndexReady().then((result) => {
      if (!cancelled) setStatus(result);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return status;
}
