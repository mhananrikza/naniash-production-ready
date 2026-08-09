import type { Config } from "tailwindcss";

/**
 * Design tokens — "Hadiah dari Langit"
 *
 * Palette rationale (lihat DESIGN.md untuk detail lengkap):
 * - langit  : dusk-to-night indigo — warna dasar, menaungi seperti langit senja
 * - cahaya  : warm gold — "hadiah" itu sendiri, cahaya yang turun
 * - senja   : dusty rose — sentuhan hangat & keibuan
 * - nur     : deep plum-indigo — aksen teks/emphasis, dari kata "cahaya" dlm bhs Arab
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
          50: "#F1EFFB",
          100: "#DFDAF2",
          300: "#8478C3",
          500: "#463C82",
          700: "#2C2555",
          900: "#1E1B3A",
          950: "#141230",
        },
        cahaya: {
          100: "#FBEACB",
          300: "#F0C784",
          500: "#E7A94C",
          600: "#CE8F35",
          700: "#A8712A",
        },
        senja: {
          100: "#F6DEE1",
          300: "#E6AEB4",
          400: "#D98A94",
          500: "#C96E7A",
          700: "#9A4A56",
        },
        nur: {
          300: "#7B6FAE",
          500: "#4A3F7A",
          700: "#332B57",
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
