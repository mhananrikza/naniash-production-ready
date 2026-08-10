"use client";

import { Flame } from "lucide-react";

import { Naniash } from "@/components/naniash/naniash";
import { Badge } from "@/components/ui/badge";
import { useDailyJourneyStreak } from "@/hooks/use-daily-journey-streak";

/**
 * Sapaan pembuka Home — Naniash "berbicara" lewat bubble di samping
 * karakternya, bukan sekadar teks header biasa. Copy tetap
 * "Assalamu'alaikum, Bunda" (bukan sapaan berbasis jam) sesuai Prompt 21.
 * Badge streak dihitung dari riwayat Daily Journey Engine yang sungguh
 * tersimpan di IndexedDB (`useDailyJourneyStreak`), bukan angka contoh —
 * disembunyikan dulu selagi belum ada riwayat sama sekali.
 *
 * `priority` di Naniash mendorong Next.js mem-preload aset ini — komponen
 * ini adalah elemen pertama yang tampil di Home, jadi biasanya jadi LCP
 * (Largest Contentful Paint) di mobile. Tanpa `priority`, aset dimuat
 * lazy dan bisa membuat sapaan pembuka terasa lambat muncul di koneksi
 * lambat.
 */
export function GreetingHeader() {
  const { streak, status } = useDailyJourneyStreak();

  return (
    <div className="flex items-start gap-3">
      <Naniash pose="welcome" size={64} className="shrink-0" priority />

      <div className="min-w-0 flex-1 rounded-2xl rounded-tl-sm border border-border bg-card px-4 py-3 shadow-sm">
        <div className="flex items-start justify-between gap-2">
          <p className="font-display text-lg font-medium leading-snug text-foreground">
            Assalamu&apos;alaikum, Bunda 🌷
          </p>
          {status === "ready" && streak > 0 ? (
            <Badge className="shrink-0">
              <Flame className="h-3 w-3 fill-cahaya-500 text-cahaya-500" />
              {streak} hari
            </Badge>
          ) : null}
        </div>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Naniash sudah menyiapkan perjalanan kecil untuk hari ini.
        </p>
      </div>
    </div>
  );
}
