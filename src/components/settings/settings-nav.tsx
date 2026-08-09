"use client";

import * as React from "react";

import { settingsSections } from "@/config/settings";
import { cn } from "@/lib/utils";

/**
 * Navigasi antar section Settings. Di layar sempit tampil sebagai chip
 * yang bisa discroll horizontal (pola sama seperti `CategoryFilter` di
 * Perpustakaan); di layar ≥768px tampil sebagai sidebar sticky di
 * samping konten (lihat `SettingsPageClient`) — bukan bottom nav/sidebar
 * utama aplikasi, khusus untuk berpindah antar section di halaman ini.
 *
 * Section aktif dideteksi lewat `IntersectionObserver` terhadap tiap
 * `<section id="...">`, bukan berdasarkan klik terakhir — supaya tetap
 * akurat walau pengguna scroll manual tanpa mengklik nav.
 */
export function SettingsNav() {
  const [activeId, setActiveId] = React.useState(settingsSections[0]?.id ?? "");

  React.useEffect(() => {
    const elements = settingsSections
      .map((section) => document.getElementById(section.id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible[0]) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-15% 0px -70% 0px", threshold: 0 }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  function handleClick(id: string) {
    setActiveId(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <>
      {/* Mobile / tablet sempit: chip horizontal scroll */}
      <nav
        aria-label="Navigasi pengaturan"
        className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:hidden"
      >
        {settingsSections.map((section) => {
          const Icon = section.icon;
          const isActive = section.id === activeId;
          return (
            <button
              key={section.id}
              type="button"
              onClick={() => handleClick(section.id)}
              aria-current={isActive ? "true" : undefined}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-medium transition-colors",
                isActive
                  ? "border-transparent bg-primary/15 text-primary"
                  : "border-border text-muted-foreground hover:bg-muted"
              )}
            >
              <Icon className="h-3.5 w-3.5" strokeWidth={isActive ? 2.25 : 1.75} />
              {section.title}
            </button>
          );
        })}
      </nav>

      {/* Desktop / tablet lebar: sidebar sticky */}
      <nav
        aria-label="Navigasi pengaturan"
        className="sticky top-20 hidden w-52 shrink-0 flex-col gap-1 self-start md:flex"
      >
        {settingsSections.map((section) => {
          const Icon = section.icon;
          const isActive = section.id === activeId;
          return (
            <button
              key={section.id}
              type="button"
              onClick={() => handleClick(section.id)}
              aria-current={isActive ? "true" : undefined}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" strokeWidth={isActive ? 2.25 : 1.75} />
              {section.title}
            </button>
          );
        })}
      </nav>
    </>
  );
}
