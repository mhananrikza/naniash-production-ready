"use client";

import { Download, Share, SquarePlus, X } from "lucide-react";

import { useInstallPrompt } from "@/hooks/use-install-prompt";
import { Button } from "@/components/ui/button";

/**
 * Banner ajakan instal PWA. Muncul di bawah layar (tidak menutupi
 * BottomNav berkat posisi `bottom-20`) hanya ketika:
 * - Chrome/Edge/Android: `beforeinstallprompt` sudah tertangkap
 *   (`canInstall`), tombol langsung memicu dialog instal native.
 * - iOS Safari: tidak ada API instal otomatis, jadi ditampilkan langkah
 *   manual "Bagikan -> Tambah ke Layar Utama".
 * Tidak tampil sama sekali kalau sudah berjalan sebagai app terinstal,
 * atau baru saja ditutup oleh Bunda (lihat cooldown di hook).
 */
export function InstallPrompt() {
  const { canInstall, showIosHint, promptInstall, dismiss } = useInstallPrompt();

  if (!canInstall && !showIosHint) return null;

  return (
    <div
      role="dialog"
      aria-label="Instal aplikasi"
      className="fixed inset-x-4 bottom-20 z-40 mx-auto flex max-w-sm items-start gap-3 rounded-xl border border-border bg-card p-4 text-card-foreground shadow-lg sm:inset-x-auto sm:right-4 sm:bottom-4"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Download className="h-4 w-4" aria-hidden />
      </span>

      <div className="flex-1 space-y-1.5">
        <p className="text-sm font-medium text-foreground">Pasang Hadiah dari Langit</p>

        {canInstall ? (
          <>
            <p className="text-xs text-muted-foreground">
              Akses lebih cepat dari layar utama, dan materi tetap terbuka walau tanpa internet.
            </p>
            <Button size="sm" onClick={promptInstall} className="mt-1">
              Instal aplikasi
            </Button>
          </>
        ) : (
          <p className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
            Ketuk
            <Share className="mx-0.5 inline h-3.5 w-3.5" aria-hidden />
            <span className="font-medium text-foreground">Bagikan</span>, lalu pilih
            <SquarePlus className="mx-0.5 inline h-3.5 w-3.5" aria-hidden />
            <span className="font-medium text-foreground">Tambah ke Layar Utama</span>.
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={dismiss}
        aria-label="Tutup ajakan instal"
        className="shrink-0 rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
      >
        <X className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
}
