import { ShieldCheck } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Card "Informasi Offline" (Prompt 25, bagian 9) — murni informatif,
 * tidak ada aksi. Ditempatkan sebagai section terakhir supaya terasa
 * seperti penutup/pengingat, bukan promosi produk.
 */
export function OfflineInfoCard() {
  return (
    <section id="offline" aria-labelledby="offline-heading" className="scroll-mt-24">
      <Card className="bg-muted/40">
        <CardHeader>
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="h-5 w-5 text-primary" aria-hidden />
            <CardTitle id="offline-heading" className="text-base">
              Mode Offline Aktif
            </CardTitle>
          </div>
          <CardDescription>
            Data pribadi Bunda tersimpan di perangkat ini dan aplikasi tetap dapat digunakan tanpa
            internet.
          </CardDescription>
        </CardHeader>
      </Card>
    </section>
  );
}
