import type { NaniashPose } from "@/components/naniash/naniash-character";

export interface OnboardingSlide {
  eyebrow: string;
  title: string;
  description: string;
  pose: NaniashPose;
}

/**
 * Konten 3 slide onboarding. Pisahkan dari halaman supaya copy bisa
 * diubah tanpa menyentuh logic carousel di page.tsx.
 */
export const onboardingSlides: OnboardingSlide[] = [
  {
    eyebrow: "01 — Selamat Datang",
    title: "Kenalkan, Naniash",
    description:
      "Sobat kecil yang akan menemani Bunda setiap hari — mengingatkan doa, mendampingi tirakat, dan merayakan setiap langkah kecil untuk buah hati.",
    pose: "wave",
  },
  {
    eyebrow: "02 — Pendamping Doa Harian",
    title: "Doa & tirakat, tanpa ribet dicari",
    description:
      "Kumpulan doa situasional dan checklist tirakat harian tersusun rapi, tinggal dibuka saat dibutuhkan — pagi, siang, atau di tengah malam yang hening.",
    pose: "book",
  },
  {
    eyebrow: "03 — AI Sobat Bunda",
    title: "Tanya apa saja pada Naniash",
    description:
      "Saat perlu teman bicara, Naniash siap menjawab dengan tenang — jawabannya selalu bersumber dari kumpulan doa terpercaya, bukan sekadar tebakan.",
    pose: "chat",
  },
];
