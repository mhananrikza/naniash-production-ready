import { NaniashFamily } from "@/components/naniash/naniash-family";

/**
 * Hero Card — elemen paling emosional di Home, sebelum Bunda melihat
 * checklist atau progres apa pun. Tombolnya mengarah ke section Daily
 * Journey lewat anchor `#perjalanan-hari-ini` (di halaman yang sama),
 * bukan rute baru — Daily Journey Engine sudah punya tempatnya sendiri di
 * Home, jadi Hero cukup "mengantar" ke sana dengan scroll halus.
 */
export function HeroCard() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-langit p-6 text-langit-50 shadow-md sm:p-8">
      <div
        className="pointer-events-none absolute -right-12 -top-16 h-48 w-48 rounded-full bg-cahaya-500/25 blur-2xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-20 -left-12 h-44 w-44 rounded-full bg-senja-400/20 blur-2xl"
        aria-hidden
      />

      <div className="relative flex flex-col items-center gap-5 text-center sm:flex-row sm:items-center sm:gap-8 sm:text-left">
        <NaniashFamily scene="family" size={128} className="shrink-0" />

        <div className="max-w-md space-y-4">
          <p className="font-display text-xl font-medium leading-snug tracking-tight sm:text-2xl">
            Hari ini tidak harus sempurna.
            <br />
            Cukup luangkan beberapa menit untuk mendekat kepada Allah.
          </p>

          <a
            href="#perjalanan-hari-ini"
            className="inline-flex items-center justify-center rounded-full bg-cahaya-500 px-5 py-2.5 text-sm font-medium text-nur-700 shadow-sm transition-colors hover:bg-cahaya-500/90"
          >
            Mulai Perjalanan Hari Ini
          </a>
        </div>
      </div>
    </div>
  );
}
