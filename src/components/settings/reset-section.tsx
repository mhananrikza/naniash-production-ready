"use client";

import * as React from "react";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { isIndexedDbSupported, reminderEngineService, resetService } from "@/lib/db";

type ConfirmStep = "closed" | "warn" | "final";

/**
 * Section "Zona Berbahaya" (Prompt 25, bagian 8): hapus SEMUA data
 * pribadi lokal (journal, favorit, progress, challenge, reminder,
 * riwayat baca, perjalanan harian, dan pengaturan). Materi aplikasi
 * TIDAK tersentuh — lihat `resetService`/`RESETTABLE_STORE_NAMES` untuk
 * daftar store yang dihapus.
 *
 * Konfirmasi dua tahap lewat SATU dialog dengan dua langkah (`warn` ->
 * `final`), bukan dua dialog terpisah, supaya alurnya tetap terasa satu
 * kesatuan — tombol "Lanjutkan" di langkah pertama TIDAK menghapus apa
 * pun, hanya membuka langkah kedua yang berisi tombol destruktif
 * sesungguhnya.
 */
export function ResetSection() {
  const [step, setStep] = React.useState<ConfirmStep>("closed");
  const [deleting, setDeleting] = React.useState(false);
  const [done, setDone] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  function handleDialogOpenChange(open: boolean) {
    if (!open) setStep("closed");
  }

  async function handleConfirmDelete() {
    if (!isIndexedDbSupported()) {
      setErrorMessage("Penghapusan butuh IndexedDB, yang tidak tersedia di perangkat/browser ini.");
      setStep("closed");
      return;
    }

    setDeleting(true);
    setErrorMessage(null);
    try {
      await resetService.resetAllUserData();
      await reminderEngineService.syncSchedule();
      setDone(true);
      setStep("closed");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Gagal menghapus data.");
      setStep("closed");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <section id="reset" aria-labelledby="reset-heading" className="scroll-mt-24">
      <Card className="border-destructive/30 bg-destructive/5">
        <CardHeader>
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="h-5 w-5 text-destructive" aria-hidden />
            <CardTitle id="reset-heading" className="text-destructive">
              Zona Berbahaya
            </CardTitle>
          </div>
          <CardDescription>
            Semua journal, favorit, progress, dan pengaturan akan dihapus dari perangkat ini.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button type="button" variant="destructive" onClick={() => setStep("warn")}>
            <Trash2 /> Hapus Semua Data
          </Button>

          {done ? (
            <p className="text-xs text-primary">Semua data pribadi berhasil dihapus dari perangkat ini.</p>
          ) : null}

          {errorMessage ? <p className="text-xs text-destructive">{errorMessage}</p> : null}

          <p className="text-xs leading-relaxed text-muted-foreground">
            Materi doa, dzikir, afirmasi, dan artikel tidak akan ikut terhapus — hanya data yang
            Bunda buat sendiri di perangkat ini.
          </p>
        </CardContent>
      </Card>

      <Dialog open={step !== "closed"} onOpenChange={handleDialogOpenChange}>
        <DialogContent>
          {step === "warn" ? (
            <>
              <DialogHeader>
                <DialogTitle>Hapus semua data?</DialogTitle>
                <DialogDescription>
                  Semua journal, favorit, progress, challenge, riwayat baca, reminder, dan
                  pengaturan Bunda akan dihapus dari perangkat ini. Tindakan ini tidak bisa
                  dibatalkan — pastikan Bunda sudah membuat backup bila masih membutuhkan datanya.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setStep("closed")}>
                  Batalkan
                </Button>
                <Button type="button" variant="destructive" onClick={() => setStep("final")}>
                  Lanjutkan
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Konfirmasi terakhir</DialogTitle>
                <DialogDescription>
                  Ini kesempatan terakhir untuk membatalkan. Setelah ditekan, seluruh data pribadi
                  Bunda di perangkat ini langsung terhapus dan tidak bisa dikembalikan.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setStep("closed")} disabled={deleting}>
                  Batalkan
                </Button>
                <Button type="button" variant="destructive" onClick={handleConfirmDelete} disabled={deleting}>
                  {deleting ? <Loader2 className="animate-spin" /> : <Trash2 />}
                  {deleting ? "Menghapus..." : "Ya, Hapus Semua Data Saya"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
