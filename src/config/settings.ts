import { User, Palette, Type, BellRing, PackageOpen, Upload, ShieldAlert, WifiOff } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface SettingsSection {
  id: string;
  title: string;
  icon: LucideIcon;
}

/**
 * Daftar section Settings (Prompt 25) — satu sumber dipakai `SettingsNav`
 * (sidebar desktop & chip mobile) dan tiap section untuk id anchor-nya,
 * supaya urutan & label tidak drift antara nav dan konten.
 */
export const settingsSections: SettingsSection[] = [
  { id: "profil", title: "Profil", icon: User },
  { id: "tampilan", title: "Tampilan", icon: Palette },
  { id: "reader", title: "Reader", icon: Type },
  { id: "reminder", title: "Reminder", icon: BellRing },
  { id: "backup", title: "Backup Data", icon: PackageOpen },
  { id: "restore", title: "Pulihkan Data", icon: Upload },
  { id: "reset", title: "Zona Berbahaya", icon: ShieldAlert },
  { id: "offline", title: "Mode Offline", icon: WifiOff },
];
