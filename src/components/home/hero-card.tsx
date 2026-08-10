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
    <div className="relative overflow-hidden rounded-[2rem] bg-gradient-langit p-6 text-nur-700 shadow-md shadow-langit-500/10 sm:p-8">
      <div
        className="pointer-events-none absolute -right-14 -top-16 h-52 w-52 rounded-full bg-cahaya-300/40 blur-2xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-20 -left-14 h-48 w-48 rounded-full bg-senja-300/40 blur-2xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute right-1/3 top-2 h-24 w-24 rounded-full bg-langit-50/60 blur-xl"
        aria-hidden
      />

      <div className="relative flex flex-col items-center gap-5 text-center sm:flex-row sm:items-center sm:gap-8 sm:text-left">
        <NaniashFamily
          scene="family"
          size={168}
          priority
          className="shrink-0 drop-shadow-[0_10px_24px_rgba(107,90,160,0.18)]"
        />

        <div className="max-w-md space-y-4">
          <p className="font-display text-xl font-medium leading-snug tracking-tight text-nur-700 sm:text-2xl">
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
