import Link from "next/link";
import { Heart } from "lucide-react";

import { Naniash } from "@/components/naniash/naniash";

/**
 * Tampilan saat belum ada satu pun item favorit. Memakai pose `happy`
 * ("Empty state / completion — tersenyum", lihat `naniash.tsx`) — bukan
 * aset baru — supaya konsisten dengan pola empty state lain di aplikasi
 * (mis. `EmptyState` Sobat Bunda, `LibraryEmptyState`).
 */
export function FavoritEmptyState() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-senja-100 bg-senja-100/30 py-12 text-center">
      <Naniash pose="happy" size={88} decorative />
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Heart className="h-4 w-4" aria-hidden />
      </span>
      <div className="space-y-1 px-6">
        <p className="font-display text-sm font-medium text-foreground">Belum ada favorit</p>
        <p className="mx-auto max-w-xs text-xs text-muted-foreground">
          Tandai doa, dzikir, afirmasi, atau artikel dengan ikon hati supaya mudah ditemukan lagi
          di sini.
        </p>
      </div>
      <Link
        href="/library"
        className="text-xs font-medium text-primary underline-offset-2 hover:underline"
      >
        Jelajahi Perpustakaan
      </Link>
    </div>
  );
}
