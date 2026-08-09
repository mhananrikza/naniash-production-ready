"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { BackupFile } from "@/lib/db";

const COUNT_LABELS: Record<keyof BackupFile["data"], string> = {
  favorites: "Favorit",
  journal: "Journal",
  progress: "Progress",
  challenge: "Challenge",
  reminder: "Reminder",
  readingHistory: "Riwayat Baca",
  dailyJourney: "Perjalanan Harian",
  settings: "Pengaturan",
};

/** Urutan tampil — data yang lebih "personal" (journal, favorit) di atas. */
const COUNT_ORDER: (keyof BackupFile["data"])[] = [
  "favorites",
  "journal",
  "progress",
  "challenge",
  "reminder",
  "readingHistory",
  "dailyJourney",
  "settings",
];

export interface RestoreSummaryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  backup: BackupFile | null;
  submitting: boolean;
  onConfirm: () => void;
}

/**
 * Dialog ringkasan (Prompt 25, bagian Restore, langkah 3–4): tampil
 * SETELAH file backup divalidasi (`backupService.parse`), SEBELUM data
 * benar-benar ditulis ke IndexedDB. Menampilkan tanggal file dibuat
 * (`meta.exportedAt`) dan jumlah data per kategori, lalu meminta
 * konfirmasi eksplisit — restore memakai mode "replace" (lihat
 * `ImportMode` di `services/backup/types.ts`), jadi dialog ini adalah
 * satu-satunya kesempatan untuk membatalkan sebelum data saat ini
 * ditimpa.
 */
export function RestoreSummaryDialog({
  open,
  onOpenChange,
  backup,
  submitting,
  onConfirm,
}: RestoreSummaryDialogProps) {
  if (!backup) return null;

  const formattedDate = new Date(backup.meta.exportedAt).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ringkasan Backup</DialogTitle>
          <DialogDescription>Backup dibuat pada {formattedDate}.</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-2.5">
          {COUNT_ORDER.map((key) => (
            <div key={key} className="rounded-lg bg-muted/60 px-3 py-2.5">
              <p className="text-lg font-semibold text-foreground">{backup.data[key].length}</p>
              <p className="text-xs text-muted-foreground">{COUNT_LABELS[key]}</p>
            </div>
          ))}
        </div>

        <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
          Memulihkan data akan MENIMPA data yang tersimpan di perangkat ini saat ini dengan isi
          file backup. Pastikan ini file yang benar sebelum melanjutkan.
        </p>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Batalkan
          </Button>
          <Button type="button" onClick={onConfirm} disabled={submitting}>
            {submitting ? <Loader2 className="animate-spin" /> : null}
            {submitting ? "Memulihkan..." : "Pulihkan Data"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
