export const siteConfig = {
  name: "Hadiah dari Langit",
  shortName: "HDL",
  description:
    "Sahabat harian Bunda untuk doa, tirakat, dan afirmasi bagi buah hati.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  companion: {
    name: "Naniash",
    tagline: "Sobat Bunda",
  },
  locale: "id-ID",
} as const;

export type SiteConfig = typeof siteConfig;
