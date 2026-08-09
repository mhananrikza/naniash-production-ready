"use client";

import * as React from "react";

import { isIndexedDbSupported, reminderEngineService } from "@/lib/db";

/**
 * Tidak me-render apa pun — hanya memanggil `reminderEngineService.start()`
 * sekali setelah mount di client, sama seperti pola `SearchIndexInitializer`.
 * Tanpa ini, jadwal reminder pagi/malam yang diatur di Settings
 * (`ReminderSection`) tidak pernah benar-benar dipasang sebagai timer.
 */
export function ReminderEngineInitializer() {
  React.useEffect(() => {
    if (!isIndexedDbSupported()) return;
    void reminderEngineService.start();
  }, []);

  return null;
}
