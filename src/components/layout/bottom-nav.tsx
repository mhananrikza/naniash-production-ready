"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { mainNavItems } from "@/config/navigation";
import { cn } from "@/lib/utils";

/**
 * Navigasi bawah untuk mobile & tablet kecil — tersembunyi di layar
 * ≥768px, digantikan Sidebar (lihat pola adaptif di roadmap Phase 1,
 * checklist D). Bentuk "pill" mengambang meniru kartu lentera, selaras
 * dengan radius besar di seluruh design system.
 */
export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navigasi utama"
      className="fixed inset-x-0 bottom-0 z-40 mx-auto flex w-full justify-center px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:hidden"
    >
      <div className="flex w-full max-w-md items-center justify-between gap-1 rounded-2xl border border-border bg-card/95 px-2 py-2 shadow-lg shadow-black/5 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        {mainNavItems.map((item) => {
          const isActive =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex min-h-11 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-2 py-1.5 text-[11px] font-medium transition-colors",
                isActive
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5" strokeWidth={isActive ? 2.25 : 1.75} />
              <span>{item.shortTitle ?? item.title}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
