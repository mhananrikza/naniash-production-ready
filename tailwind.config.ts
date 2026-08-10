import type { Config } from "tailwindcss";

/**
 * Design tokens — "Hadiah dari Langit"
 *
 * Palette rationale (lihat DESIGN.md untuk detail lengkap):
 * - langit  : sky blue pastel — warna dasar, menaungi seperti langit pagi berawan
 * - cahaya  : soft gold — "hadiah" itu sendiri, cahaya lembut yang turun
 * - senja   : dusty pink — sentuhan hangat & keibuan
 * - nur     : soft lavender — aksen teks/emphasis, dari kata "cahaya" dlm bhs Arab
 *
 * [Visual redesign — sky/cloud/pink/lavender/gold pastel, lihat brief
 * "Hadiah dari Langit" untuk detail. Nama token & struktur data TIDAK
 * berubah, hanya nilai warna, supaya seluruh komponen yang sudah memakai
 * token ini otomatis ikut ter-restyle tanpa perlu diedit satu-satu.]
 *
 * Semantic tokens (background, primary, dst.) dikontrol lewat CSS variables
 * di globals.css supaya light/dark mode konsisten dengan shadcn/ui.
 */
const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: {
        "2xl": "1280px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Raw brand scale — dipakai untuk elemen dekoratif/gradient
        // yang butuh warna tetap, di luar pergantian light/dark.
        langit: {
          50: "#F1F8FD",
          100: "#DCEDF9",
          300: "#A9D3EE",
          500: "#6FAEDD",
          700: "#3E7FB0",
          900: "#2A5C82",
          950: "#1D4360",
        },
        cahaya: {
          100: "#FBEFD4",
          300: "#F1D99D",
          500: "#E7C179",
          600: "#CBA152",
          700: "#A87F3A",
        },
        senja: {
          100: "#FCE9EC",
          300: "#F1C7CD",
          400: "#E4A7B0",
          500: "#D48C97",
          700: "#A15F6A",
        },
        nur: {
          100: "#EDE8F7",
          300: "#C2B6E8",
          500: "#9585CC",
          700: "#6B5AA0",
        },
      },
      fontFamily: {
        sans: ["var(--font-plus-jakarta)"],
        display: ["var(--font-fraunces)"],
      },
      borderRadius: {
        xl: "calc(var(--radius) + 4px)",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 4px)",
        sm: "calc(var(--radius) - 8px)",
      },
      backgroundImage: {
        "gradient-langit":
          "linear-gradient(135deg, hsl(var(--langit-grad-start)) 0%, hsl(var(--langit-grad-mid)) 55%, hsl(var(--langit-grad-end)) 100%)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        berkelip: {
          "0%, 100%": { opacity: "0.4", transform: "scale(0.85)" },
          "50%": { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        berkelip: "berkelip 2.6s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
};

export default config;
