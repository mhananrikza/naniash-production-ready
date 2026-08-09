import { Home, HandHeart, ListChecks, Heart, Library, Settings } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  /** Label pendek untuk bottom nav di layar sempit. */
  shortTitle?: string;
}

/**
 * Item navigasi utama — cakupan Phase 1 (lihat roadmap).
 * Tambahkan item baru di sini saja; Header, BottomNav, dan Sidebar
 * membaca dari satu sumber ini supaya tidak drift.
 */
export const mainNavItems: NavItem[] = [
  {
    title: "Beranda",
    href: "/",
    icon: Home,
  },
  {
    title: "Doa Situasional",
    shortTitle: "Doa",
    href: "/doa",
    icon: HandHeart,
  },
  {
    title: "Tirakat Harian",
    shortTitle: "Tirakat",
    href: "/tirakat",
    icon: ListChecks,
  },
  {
    title: "Perpustakaan",
    shortTitle: "Materi",
    href: "/library",
    icon: Library,
  },
  {
    title: "Favorit",
    href: "/favorit",
    icon: Heart,
  },
];

/**
 * Item navigasi "Pengaturan" — sengaja TERPISAH dari `mainNavItems`
 * (bukan ditambahkan ke BottomNav yang sudah padat dengan 5 item di
 * layar mobile). Dipakai `Header` (lewat avatar) dan `Sidebar` (lewat
 * item tambahan di bawah separator) sebagai titik masuk ke `/settings`.
 */
export const settingsNavItem: NavItem = {
  title: "Pengaturan",
  href: "/settings",
  icon: Settings,
};
