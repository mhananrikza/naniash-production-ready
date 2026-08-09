import Image from "next/image";

import { cn } from "@/lib/utils";

/**
 * Naniash Family Moments — set ilustrasi watercolor terpisah dari
 * `<Naniash />` (karakter tunggal). JANGAN dicampur: komponen ini khusus
 * untuk momen keluarga (Naniash bersama anak), dipakai di titik-titik
 * emosional tertentu di app — bukan avatar AI, bukan icon aplikasi.
 *
 * Aset asli (tidak digenerate ulang, tidak di-crop) disimpan di:
 *   /public/images/naniash/family/prayer.png    — Naniash berdoa
 *   /public/images/naniash/family/daughter.png  — Naniash memeluk anak perempuan
 *   /public/images/naniash/family/son.png       — Naniash memeluk anak laki-laki
 *   /public/images/naniash/family/family.png    — Naniash bersama dua anak
 */

export type NaniashFamilyScene = "prayer" | "daughter" | "son" | "family";

const SCENE_SRC_MAP: Record<NaniashFamilyScene, string> = {
  prayer: "/images/naniash/family/prayer.png",
  daughter: "/images/naniash/family/daughter.png",
  son: "/images/naniash/family/son.png",
  family: "/images/naniash/family/family.png",
};

const SCENE_ALT_MAP: Record<NaniashFamilyScene, string> = {
  prayer: "Naniash sedang berdoa dengan tangan menengadah",
  daughter: "Naniash memeluk anak perempuan",
  son: "Naniash memeluk anak laki-laki",
  family: "Naniash bersama dua anak",
};

export interface NaniashFamilyProps {
  scene: NaniashFamilyScene;
  /** Lebar & tinggi render dalam px (aset berbentuk persegi). Default 160. */
  size?: number;
  className?: string;
  alt?: string;
  decorative?: boolean;
  priority?: boolean;
}

export function NaniashFamily({
  scene,
  size = 160,
  className,
  alt,
  decorative = false,
  priority = false,
}: NaniashFamilyProps) {
  const src = SCENE_SRC_MAP[scene];
  const resolvedAlt = decorative ? "" : alt ?? SCENE_ALT_MAP[scene];

  return (
    <Image
      src={src}
      alt={resolvedAlt}
      width={size}
      height={size}
      priority={priority}
      className={cn("select-none rounded-2xl object-cover", className)}
      style={{ width: size, height: size }}
    />
  );
}
