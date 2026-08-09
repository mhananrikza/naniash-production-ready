"use client";

import * as React from "react";

import { isIndexedDbSupported, reminderEngineService, reminderSettingsService } from "@/lib/db";
import type { ReminderEngineSettings } from "@/services/reminder-engine";

/**
 * State + aksi pengaturan Reminder Engine (jam pagi/malam, aktif/nonaktif
 * reminder doa & journal), dibaca/ditulis lewat `reminderSettingsService`
 * (store `settings`, key `"reminderEngine"`). Setiap perubahan langsung
 * memicu `reminderEngineService.syncSchedule()` supaya timer in-memory
 * ikut menyesuaikan tanpa perlu memuat ulang halaman.
 */
export function useReminderSettings() {
  const [settings, setSettings] = React.useState<ReminderEngineSettings>(reminderSettingsService.defaults());
  const [hydrated, setHydrated] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    if (!isIndexedDbSupported()) {
      setHydrated(true);
      return;
    }

    reminderSettingsService.get().then((data) => {
      if (!cancelled) {
        setSettings(data);
        setHydrated(true);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const update = React.useCallback(async (patch: Partial<ReminderEngineSettings>) => {
    setSaving(true);
    setError(null);
    try {
      const next = await reminderSettingsService.update(patch);
      setSettings(next);
      await reminderEngineService.syncSchedule();
      return next;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan pengaturan reminder.");
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  return { settings, hydrated, saving, error, update };
}
