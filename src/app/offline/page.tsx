"use client";

import * as React from "react";
import Link from "next/link";
import { WifiOff, Library, RotateCw } from "lucide-react";

import { Button } from "@/components/ui/button";

/**
 * Halaman fallback offline.
 *
 * Dirujuk dari `next.config.mjs` (`fallbacks.document: "/offline"`) —
 * service worker menampilkan halaman ini ketika sebuah dokumen/halaman
 * diminta saat offline, TAPI halaman tersebut belum pernah tersimpan di
 * cache (mis. tautan yang belum pernah dibuka sama sekali). Halaman-
 * halaman yang sudah pernah dibuka (atau termasuk daftar precache di
 * `next.config.mjs`, seperti seluruh artikel Perpustakaan) tidak akan
 * pernah mendarat di sini — mereka langsung tersaji dari cache.
 *
 * Sengaja diletakkan di luar folder rute `(app)` supaya tidak bergantung
 * pada layout/shell yang lebih berat (Header, Sidebar, BottomNav) — biar
 * selalu bisa dirender walau kondisi jaringan sedang buruk.
 */
export default function OfflinePage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-background px-6 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <WifiOff className="h-7 w-7" aria-hidden />
      </span>

      <div className="space-y-2">
        <h1 className="font-display text-xl font-semibold text-foreground">
          Halaman ini belum tersedia offline
        </h1>
        <p className="mx-auto max-w-xs text-sm text-muted-foreground">
          Sepertinya koneksi internet sedang terputus dan halaman ini belum pernah dibuka
          sebelumnya. Materi Perpustakaan yang sudah tersimpan tetap bisa dibaca kok, Bun.
        </p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button onClick={() => window.location.reload()} variant="default">
          <RotateCw className="h-4 w-4" aria-hidden />
          Coba lagi
        </Button>
        <Button asChild variant="outline">
          <Link href="/library">
            <Library className="h-4 w-4" aria-hidden />
            Buka Perpustakaan
          </Link>
        </Button>
      </div>
    </main>
  );
}
