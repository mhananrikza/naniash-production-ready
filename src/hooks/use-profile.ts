"use client";

import * as React from "react";

import { isIndexedDbSupported, profileService } from "@/lib/db";
import type { ProfileData } from "@/lib/db";

/**
 * State + aksi profil pengguna (nama panggilan Bunda), dibaca/ditulis lewat
 * `profileService` (store `settings`, key `"profile"`). Dipakai oleh
 * `ProfileSection` di halaman Settings, dan bisa dipakai ulang di Header
 * kelak bila nama ingin ditampilkan di sana juga.
 */
export function useProfile() {
  const [profile, setProfile] = React.useState<ProfileData>(profileService.defaults());
  const [hydrated, setHydrated] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    if (!isIndexedDbSupported()) {
      setHydrated(true);
      return;
    }

    profileService.get().then((data) => {
      if (!cancelled) {
        setProfile(data);
        setHydrated(true);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const updateName = React.useCallback(async (name: string) => {
    setSaving(true);
    setError(null);
    try {
      const next = await profileService.updateName(name);
      setProfile(next);
      return next;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan nama.");
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  return {
    profile,
    hydrated,
    saving,
    error,
    updateName,
    initials: profileService.initials(profile.name),
  };
}
