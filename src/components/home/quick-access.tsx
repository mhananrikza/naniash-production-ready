import Link from "next/link";
import { HandHeart, Repeat, Sun, Library } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface QuickAccessItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

const items: QuickAccessItem[] = [
  { label: "Doa", href: "/doa", icon: HandHeart },
  { label: "Dzikir", href: "/dzikir", icon: Repeat },
  { label: "Afirmasi", href: "/afirmasi", icon: Sun },
  { label: "Artikel", href: "/library", icon: Library },
];

/**
 * Shortcut ke 4 jenis materi Content Engine. Ikon konsisten dengan bahasa
 * visual navigasi utama (`config/navigation.ts`) — bukan ikon acak per
 * kartu, supaya makna "Doa" dsb. selalu diwakili simbol yang sama di
 * seluruh aplikasi.
 */
export function QuickAccess() {
  return (
    <div className="grid grid-cols-4 gap-3">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card px-2 py-4 text-center shadow-sm transition-colors hover:border-primary/40 hover:bg-muted/60"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Icon className="h-5 w-5" strokeWidth={1.75} />
            </span>
            <span className="text-xs font-medium text-foreground">{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
