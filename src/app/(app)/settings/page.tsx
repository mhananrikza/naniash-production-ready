import type { Metadata } from "next";

import { SettingsPageClient } from "@/components/settings/settings-page-client";

export const metadata: Metadata = {
  title: "Pengaturan — Hadiah dari Langit",
  description: "Atur profil, tampilan, reminder, dan kelola backup data Bunda di perangkat ini.",
};

/**
 * Halaman Settings (Prompt 25 — Settings + Backup & Restore). Seluruh
 * data dibaca/ditulis lewat service di `@/lib/db` (IndexedDB) — tidak
 * ada panggilan jaringan, konsisten dengan arsitektur Offline First +
 * Local Only aplikasi ini.
 */
export default function SettingsPage() {
  return <SettingsPageClient />;
}
