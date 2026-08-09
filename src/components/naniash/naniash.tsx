import Image from "next/image";

import { cn } from "@/lib/utils";

/**
 * Naniash — karakter maskot resmi aplikasi.
 *
 * Aset final per-pose (tidak digenerate ulang) disimpan di
 * `/public/images/naniash/`:
 *   welcome.png, morning.png, listening.png, family-reading.png
 *
 * Pose yang belum punya aset final sendiri (`pray`, `reading`, `hug`,
 * `night`, `happy`, `ai`) untuk sementara jatuh ke aset generik lama
 * (`naniash.png`) lewat `GENERIC_ASSET_SRC` di bawah. Begitu asetnya
 * tersedia, cukup isi path-nya di `POSE_SRC_MAP` — tidak perlu ubah
 * pemanggilan di komponen lain.
 */

export type NaniashPose =
  | "welcome" // Home — menyapa (Welcome_Naniash.png)
  | "morning" // Home pagi — morning greeting (Morning_Naniash.png)
  | "listening" // Naniash AI — sedang mendengarkan/memproses (Listening_Naniash.png)
  | "family-reading" // Library / artikel keluarga — membaca bersama anak (membaca_bersama_anak.png)
  | "phone" // Naniash AI / tutorial / notifikasi — pegang HP
  | "journaling" // Journal — menulis di meja
  | "reading" // Library / Reader — membaca sendiri
  | "open-hands" // Home / reflection / CTA — tangan terbuka
  | "gift" // Completion / milestone — membawa hadiah
  | "reflection" // Journal / mood / refleksi emosional — duduk tenang
  | "prayer" // Daily Journey / Doa — berdoa di sajadah
  | "pray" // (lama, belum ada aset final terpisah — fallback generik)
  | "hug" // Parenting / emotional section — memeluk anak
  | "night" // Reminder malam — suasana malam
  | "happy" // Empty state / completion — tersenyum
  | "ai"; // Naniash AI Chat

const GENERIC_ASSET_SRC = "/images/naniash/naniash.png";

// Map pose -> source. Pose dengan aset final terpisah menunjuk ke filenya
// sendiri; pose yang belum punya aset final tetap memakai file generik
// lama sebagai fallback (tidak ada karakter baru yang digenerate).
const POSE_SRC_MAP: Record<NaniashPose, string> = {
  welcome: "/images/naniash/welcome.png",
  morning: "/images/naniash/morning.png",
  listening: "/images/naniash/listening.png",
  "family-reading": "/images/naniash/family-reading.png",
  phone: "/images/naniash/phone.png",
  journaling: "/images/naniash/journaling.png",
  reading: "/images/naniash/reading.png",
  "open-hands": "/images/naniash/open-hands.png",
  gift: "/images/naniash/gift.png",
  reflection: "/images/naniash/reflection.png",
  prayer: "/images/naniash/prayer.png",
  pray: GENERIC_ASSET_SRC,
  hug: GENERIC_ASSET_SRC,
  night: GENERIC_ASSET_SRC,
  happy: GENERIC_ASSET_SRC,
  ai: GENERIC_ASSET_SRC,
};

const POSE_ALT_MAP: Record<NaniashPose, string> = {
  welcome: "Naniash menyapa",
  morning: "Naniash menyambut pagi",
  listening: "Naniash sedang mendengarkan",
  "family-reading": "Naniash membaca bersama anak",
  phone: "Naniash memegang HP",
  journaling: "Naniash menulis di meja",
  reading: "Naniash sedang membaca",
  "open-hands": "Naniash membuka tangan",
  gift: "Naniash membawa hadiah",
  reflection: "Naniash duduk tenang",
  prayer: "Naniash sedang berdoa di atas sajadah",
  pray: "Naniash sedang berdoa",
  hug: "Naniash memeluk anak",
  night: "Naniash dalam suasana malam",
  happy: "Naniash tersenyum",
  ai: "Naniash, sobat AI Bunda",
};

export interface NaniashProps {
  /** Konteks kemunculan Naniash. Menentukan aset yang dipakai (lihat POSE_SRC_MAP). */
  pose?: NaniashPose;
  /** Lebar & tinggi render dalam px (aset berbentuk persegi). Default 96. */
  size?: number;
  className?: string;
  /** Override alt text bila perlu; default mengikuti `pose`. */
  alt?: string;
  /** true = elemen dianggap dekoratif (alt kosong untuk screen reader). */
  decorative?: boolean;
  priority?: boolean;
}

export function Naniash({
  pose = "welcome",
  size = 96,
  className,
  alt,
  decorative = false,
  priority = false,
}: NaniashProps) {
  const src = POSE_SRC_MAP[pose];
  const resolvedAlt = decorative ? "" : alt ?? POSE_ALT_MAP[pose];

  return (
    <Image
      src={src}
      alt={resolvedAlt}
      width={size}
      height={size}
      priority={priority}
      className={cn("select-none object-contain", className)}
      style={{ width: size, height: size }}
    />
  );
}
