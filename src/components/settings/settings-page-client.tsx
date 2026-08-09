"use client";

import { Naniash } from "@/components/naniash/naniash";
import { SettingsNav } from "@/components/settings/settings-nav";
import { ProfileSection } from "@/components/settings/profile-section";
import { AppearanceSection } from "@/components/settings/appearance-section";
import { ReaderSection } from "@/components/settings/reader-section";
import { ReminderSection } from "@/components/settings/reminder-section";
import { BackupSection } from "@/components/settings/backup-section";
import { RestoreSection } from "@/components/settings/restore-section";
import { ResetSection } from "@/components/settings/reset-section";
import { OfflineInfoCard } from "@/components/settings/offline-info-card";
import { Reveal } from "@/components/ui/reveal";

/**
 * Halaman Settings (Prompt 25). Naniash sengaja HANYA muncul kecil di
 * header halaman — bukan di tiap card — supaya Settings tetap terasa
 * fungsional, bukan "ruang promosi" (sesuai instruksi prompt).
 *
 * Layout: mobile-first, satu kolom dengan chip nav horizontal di atas.
 * Di layar ≥768px, `SettingsNav` menampilkan sidebar sticky di samping
 * konten (bukan mobile-only) — pola adaptif yang sama dipakai `Sidebar`
 * utama aplikasi.
 */
export function SettingsPageClient() {
  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-center sm:text-left">
        <Naniash pose="welcome" size={64} className="shrink-0" />
        <div className="space-y-1">
          <h1 className="font-display text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            Pengaturan
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Atur profil, tampilan, reminder, dan data Bunda di perangkat ini.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-6 md:flex-row md:gap-8">
        <SettingsNav />

        <div className="min-w-0 flex-1 space-y-5">
          <Reveal index={0}>
            <ProfileSection />
          </Reveal>
          <Reveal index={1}>
            <AppearanceSection />
          </Reveal>
          <Reveal index={2}>
            <ReaderSection />
          </Reveal>
          <Reveal index={3}>
            <ReminderSection />
          </Reveal>
          <Reveal index={4}>
            <BackupSection />
          </Reveal>
          <Reveal index={5}>
            <RestoreSection />
          </Reveal>
          <Reveal index={6}>
            <ResetSection />
          </Reveal>
          <Reveal index={7}>
            <OfflineInfoCard />
          </Reveal>
        </div>
      </div>
    </div>
  );
}
