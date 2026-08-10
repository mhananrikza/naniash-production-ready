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
 *
 * Padding kiri/kanan & bawah memakai `env(safe-area-inset-*)` supaya pill
 * tidak terpotong lekukan layar (notch landscape, rounded corner, home
 * indicator). Tiap item dijamin `min-h-12` (~48px, nyaman untuk jari di
 * Android maupun iPhone) dan labelnya `whitespace-nowrap` supaya tidak
 * pernah wrap 2 baris di layar sempit (360–414px).
 */
export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navigasi utama"
      className="fixed inset-x-0 bottom-0 z-40 mx-auto flex w-full justify-center pb-[max(0.75rem,env(safe-area-inset-bottom))] pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] md:hidden"
    >
      <div className="flex w-full max-w-md items-center justify-between gap-1 rounded-2xl border border-langit-100 bg-gradient-to-r from-langit-50/95 via-card/95 to-senja-100/70 px-2 py-2 shadow-lg shadow-langit-500/10 backdrop-blur supports-[backdrop-filter]:from-langit-50/80 supports-[backdrop-filter]:via-card/80 supports-[backdrop-filter]:to-senja-100/60">
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
                "flex min-h-12 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1.5 text-[11px] font-medium transition-colors",
                isActive
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5 shrink-0" strokeWidth={isActive ? 2.25 : 1.75} />
              <span className="whitespace-nowrap">{item.shortTitle ?? item.title}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
