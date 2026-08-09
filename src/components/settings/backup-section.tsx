"use client";

import * as React from "react";
import { CheckCircle2, Loader2, PackageOpen, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { backupService, isIndexedDbSupported } from "@/lib/db";

type BackupStatus = "idle" | "loading" | "success" | "error";

/**
 * Section "Backup Data" (Prompt 25, bagian 5). Memakai `backupService`
 * yang sudah dibangun sebelumnya (`src/lib/db/services/backup/`) — murni
 * menyambungkan tombol ke `backupService.exportAndDownload()`, yang
 * sudah menghasilkan file bernama
 * `hadiah-dari-langit-backup-YYYY-MM-DD.json` dan men-trigger unduhan
 * lewat elemen `<a download>` sementara (API browser standar, tidak ada
 * server yang terlibat).
 */
export function BackupSection() {
  const [status, setStatus] = React.useState<BackupStatus>("idle");
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [filename, setFilename] = React.useState<string | null>(null);

  async function handleBackup() {
    if (!isIndexedDbSupported()) {
      setStatus("error");
      setErrorMessage("Backup butuh IndexedDB, yang tidak tersedia di perangkat/browser ini.");
      return;
    }

    setStatus("loading");
    setErrorMessage(null);
    try {
      const backup = await backupService.exportAndDownload();
      setFilename(backupService.buildFilename(new Date(backup.meta.exportedAt)));
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Gagal membuat file backup.");
    }
  }

  return (
    <section id="backup" aria-labelledby="backup-heading" className="scroll-mt-24">
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <div className="flex items-center gap-2.5">
            <PackageOpen className="h-5 w-5 text-primary" aria-hidden />
            <CardTitle id="backup-heading">Backup Data</CardTitle>
          </div>
          <CardDescription>
            Simpan salinan data Bunda agar mudah dipindahkan ke perangkat lain.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button type="button" onClick={handleBackup} disabled={status === "loading"}>
            {status === "loading" ? <Loader2 className="animate-spin" /> : <Send />}
            {status === "loading" ? "Menyiapkan..." : "Cadangkan Data"}
          </Button>

          {status === "success" && filename ? (
            <p className="flex items-center gap-1.5 text-xs text-primary">
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" aria-hidden />
              Tersimpan sebagai <span className="font-medium">{filename}</span>
            </p>
          ) : null}

          {status === "error" && errorMessage ? (
            <p className="text-xs text-destructive">{errorMessage}</p>
          ) : null}

          <p className="text-xs leading-relaxed text-muted-foreground">
            Berisi favorit, journal, progress, challenge, riwayat baca, reminder, dan pengaturan
            Bunda. Materi doa/dzikir/afirmasi/artikel tidak ikut dicadangkan karena sudah menjadi
            bagian dari aplikasi.
          </p>
        </CardContent>
      </Card>
    </section>
  );
}
