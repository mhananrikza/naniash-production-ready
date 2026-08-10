"use client";

import { Download, Share, SquarePlus, X } from "lucide-react";

import { useInstallPrompt } from "@/hooks/use-install-prompt";
import { Button } from "@/components/ui/button";

/**
 * Banner ajakan instal PWA. Muncul di bawah layar hanya ketika:
 * - Chrome/Edge/Android: `beforeinstallprompt` sudah tertangkap
 *   (`canInstall`), tombol langsung memicu dialog instal native.
 * - iOS Safari: tidak ada API instal otomatis, jadi ditampilkan langkah
 *   manual "Bagikan -> Tambah ke Layar Utama".
 * Tidak tampil sama sekali kalau sudah berjalan sebagai app terinstal,
 * atau baru saja ditutup oleh Bunda (lihat cooldown di hook).
 *
 * Posisi bawah dihitung supaya selalu bersih dari BottomNav (yang tinggi
 * totalnya berubah-ubah tergantung `safe-area-inset-bottom` perangkat) —
 * bukan angka tetap seperti `bottom-20` yang bisa kepotong di iPhone
 * dengan home indicator. Breakpoint pindah-ke-pojok-kanan disamakan
 * dengan breakpoint BottomNav sendiri (`md:hidden`) supaya keduanya
 * konsisten kapan BottomNav ada/tidak ada di layar.
 */
export function InstallPrompt() {
  const { canInstall, showIosHint, promptInstall, dismiss } = useInstallPrompt();

  if (!canInstall && !showIosHint) return null;

  return (
    <div
      role="dialog"
      aria-label="Instal aplikasi"
      className="fixed z-40 mx-auto flex max-w-sm items-start gap-3 rounded-xl border border-border bg-card p-4 text-card-foreground shadow-lg left-[max(1rem,env(safe-area-inset-left))] right-[max(1rem,env(safe-area-inset-right))] bottom-[calc(5rem+env(safe-area-inset-bottom))] md:left-auto md:right-[max(1rem,env(safe-area-inset-right))] md:bottom-[max(1rem,env(safe-area-inset-bottom))]"
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
            <Button size="sm" onClick={promptInstall} className="mt-1 min-h-11">
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
        className="-m-1.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground active:bg-accent"
      >
        <X className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
}
