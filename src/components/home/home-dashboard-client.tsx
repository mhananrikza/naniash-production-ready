"use client";

import { Reveal } from "@/components/ui/reveal";
import { HeroCard } from "@/components/home/hero-card";
import { DailyJourneyCard } from "@/components/home/daily-journey-card";
import { ContinueReadingCard } from "@/components/home/continue-reading-card";
import { DoaHariIniCard } from "@/components/home/doa-hari-ini-card";
import { QuickAccess } from "@/components/home/quick-access";
import { AiSobatBundaCard } from "@/components/home/ai-sobat-bunda-card";
import { ChallengeCard } from "@/components/home/challenge-card";
import { useDailyJourney } from "@/hooks/use-daily-journey";
import type { LibraryArticleMeta } from "@/types";

export interface HomeDashboardClientProps {
  /** Metadata artikel (Content Engine, sudah dipangkas server-side di `page.tsx`). */
  articles: LibraryArticleMeta[];
}

/**
 * Orkestrator interaktif Home (Client Component), menerima data yang
 * butuh `fs`/server (daftar artikel) sebagai props dari `page.tsx`, dan
 * memegang SATU instance `useDailyJourney` yang dipakai bareng oleh kartu
 * "Perjalanan Hari Ini" dan "Doa Hari Ini" — supaya manifest & IndexedDB
 * cuma dibaca sekali per kunjungan, bukan dua kali untuk data yang sama.
 */
export function HomeDashboardClient({ articles }: HomeDashboardClientProps) {
  const { status, day, error, setSlotComplete } = useDailyJourney();

  return (
    <div className="space-y-6 pb-4">
      <Reveal index={1}>
        <HeroCard />
      </Reveal>

      <Reveal index={2}>
        <DailyJourneyCard status={status} day={day} error={error} setSlotComplete={setSlotComplete} />
      </Reveal>

      <Reveal index={3}>
        <ContinueReadingCard articles={articles} />
      </Reveal>

      <Reveal index={4}>
        <DoaHariIniCard status={status} day={day} />
      </Reveal>

      <Reveal index={5}>
        <div className="space-y-3">
          <h2 className="font-display text-base font-medium tracking-tight text-foreground">
            Akses Cepat
          </h2>
          <QuickAccess />
        </div>
      </Reveal>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <Reveal index={6}>
          <AiSobatBundaCard />
        </Reveal>
        <Reveal index={7}>
          <ChallengeCard />
        </Reveal>
      </div>
    </div>
  );
}
