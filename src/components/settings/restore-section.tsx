"use client";

import * as React from "react";
import { CheckCircle2, Loader2, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RestoreSummaryDialog } from "@/components/settings/restore-summary-dialog";
import { backupService, isIndexedDbSupported, reminderEngineService } from "@/lib/db";
import type { BackupFile, ImportSummary } from "@/lib/db";

type RestoreStatus = "idle" | "validating" | "restoring" | "success" | "error";

/**
 * Section "Restore Data" (Prompt 25, bagian 6): pilih file `.json`,
 * validasi format (`backupService.parse`), tampilkan ringkasan lewat
 * `RestoreSummaryDialog`, baru tulis ke IndexedDB setelah pengguna
 * menekan "Pulihkan Data" (`backupService.restore`). Tidak pernah
 * langsung menulis dari file mentah — validasi & konfirmasi SELALU lebih
 * dulu, sesuai "Backup Safety" (bagian 7) supaya data lama tidak rusak
 * oleh file yang tidak dikenali.
 */
export function RestoreSection() {
  const inputRef = React.useRef<HTMLInputElement>(null);

  const [status, setStatus] = React.useState<RestoreStatus>("idle");
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [pendingBackup, setPendingBackup] = React.useState<BackupFile | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [importSummary, setImportSummary] = React.useState<ImportSummary | null>(null);

  function handlePickFile() {
    setErrorMessage(null);
    inputRef.current?.click();
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = ""; // supaya memilih file yang sama lagi tetap memicu onChange
    if (!file) return;

    if (!isIndexedDbSupported()) {
      setStatus("error");
      setErrorMessage("Restore butuh IndexedDB, yang tidak tersedia di perangkat/browser ini.");
      return;
    }

    setStatus("validating");
    setErrorMessage(null);
    setImportSummary(null);

    try {
      const raw = await file.text();
      const backup = backupService.parse(raw);
      setPendingBackup(backup);
      setDialogOpen(true);
      setStatus("idle");
    } catch {
      // `backupService.parse` selalu melempar `InvalidBackupFileError` untuk
      // JSON tak valid, file dari aplikasi lain, maupun struktur/versi yang
      // tidak dikenali — pesan pengguna sengaja disamakan & singkat sesuai
      // spesifikasi "Backup Safety" (bagian 7), detail teknisnya cukup ada
      // di `error.message` untuk debugging lewat console bila perlu.
      setStatus("error");
      setPendingBackup(null);
      setErrorMessage("File backup tidak dikenali.");
    }
  }

  async function handleConfirmRestore() {
    if (!pendingBackup) return;

    setStatus("restoring");
    try {
      const summary = await backupService.restore(pendingBackup, "replace");
      // Store `reminderSchedule` bukan bagian dari file backup (lihat
      // `BACKUPABLE_STORE_NAMES`) — segarkan jadwal Reminder Engine
      // secara eksplisit supaya timer ikut menyesuaikan pengaturan yang
      // baru saja dipulihkan.
      await reminderEngineService.syncSchedule();

      setImportSummary(summary);
      setStatus("success");
      setDialogOpen(false);
      setPendingBackup(null);
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Gagal memulihkan data.");
      setDialogOpen(false);
    }
  }

  return (
    <section id="restore" aria-labelledby="restore-heading" className="scroll-mt-24">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2.5">
            <Upload className="h-5 w-5 text-primary" aria-hidden />
            <CardTitle id="restore-heading">Pulihkan Data</CardTitle>
          </div>
          <CardDescription>Pindahkan data dari perangkat lama ke perangkat ini.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <input
            ref={inputRef}
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={handleFileChange}
          />

          <Button
            type="button"
            variant="outline"
            onClick={handlePickFile}
            disabled={status === "validating" || status === "restoring"}
          >
            {status === "validating" || status === "restoring" ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Upload />
            )}
            {status === "validating"
              ? "Memeriksa file..."
              : status === "restoring"
                ? "Memulihkan..."
                : "Pilih File Backup"}
          </Button>

          {status === "success" && importSummary ? (
            <p className="flex items-center gap-1.5 text-xs text-primary">
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" aria-hidden />
              Data berhasil dipulihkan 🌷
            </p>
          ) : null}

          {status === "error" && errorMessage ? (
            <p className="text-xs text-destructive">{errorMessage}</p>
          ) : null}

          <p className="text-xs leading-relaxed text-muted-foreground">
            Bunda akan melihat ringkasan isi file sebelum data dipulihkan — proses ini akan
            menimpa data yang saat ini tersimpan di perangkat.
          </p>
        </CardContent>
      </Card>

      <RestoreSummaryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        backup={pendingBackup}
        submitting={status === "restoring"}
        onConfirm={handleConfirmRestore}
      />
    </section>
  );
}
