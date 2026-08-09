"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { mainNavItems, settingsNavItem } from "@/config/navigation";
import { siteConfig } from "@/config/site";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

/**
 * Sidebar untuk tablet (≥768px) & laptop (≥1280px) — pengganti BottomNav
 * pada layar lebar, bukan tambahan mobile-only (lihat roadmap Phase 1,
 * checklist D: "pola adaptif, bukan mobile-only").
 */
export function Sidebar() {
  const pathname = usePathname();
  const isSettingsActive = pathname.startsWith(settingsNavItem.href);
  const SettingsIcon = settingsNavItem.icon;

  return (
    <aside className="sticky top-16 hidden h-[calc(100dvh-4rem)] w-60 shrink-0 flex-col border-r border-border px-3 py-6 md:flex lg:w-64">
      <nav aria-label="Navigasi utama" className="flex flex-1 flex-col gap-1">
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
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-4.5 w-4.5" strokeWidth={isActive ? 2.25 : 1.75} />
              {item.title}
            </Link>
          );
        })}
      </nav>

      <Separator className="my-4" />

      {/* Pengaturan — sengaja dipisah dari `mainNavItems` di atas, lihat
          komentar `settingsNavItem` di navigation.ts. */}
      <Link
        href={settingsNavItem.href}
        aria-current={isSettingsActive ? "page" : undefined}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
          isSettingsActive
            ? "bg-primary/15 text-primary"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        )}
      >
        <SettingsIcon className="h-4.5 w-4.5" strokeWidth={isSettingsActive ? 2.25 : 1.75} />
        {settingsNavItem.title}
      </Link>

      <Separator className="my-4" />

      <p className="px-3 text-xs leading-relaxed text-muted-foreground">
        {siteConfig.companion.name} — {siteConfig.companion.tagline}
        <br />
        hadir mulai Phase 3.
      </p>
    </aside>
  );
}
