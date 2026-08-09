"use client";

import { RefreshCw } from "lucide-react";

import { useServiceWorker } from "@/hooks/use-service-worker";
import { Button } from "@/components/ui/button";

/**
 * Tidak me-render apa pun secara normal — hanya memicu registrasi service
 * worker (lewat `useServiceWorker`) dan menampilkan toast kecil di bagian
 * bawah layar saat versi baru siap dipakai. Pasang sekali di `Providers`
 * supaya aktif di seluruh halaman.
 */
export function ServiceWorkerRegister() {
  const { status, activateUpdate } = useServiceWorker();

  if (status !== "update-available") return null;

  return (
    <div
      role="status"
      className="fixed inset-x-4 bottom-4 z-50 mx-auto flex max-w-sm items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-card-foreground shadow-lg sm:inset-x-auto sm:right-4"
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        <RefreshCw className="h-4 w-4" aria-hidden />
      </span>
      <div className="flex-1 space-y-0.5">
        <p className="text-xs font-medium text-foreground">Versi baru tersedia</p>
        <p className="text-xs text-muted-foreground">Muat ulang untuk memakai pembaruan.</p>
      </div>
      <Button size="sm" onClick={activateUpdate}>
        Muat ulang
      </Button>
    </div>
  );
}
