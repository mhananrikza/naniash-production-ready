"use client";

import * as React from "react";
import { Laptop, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const THEME_OPTIONS = [
  { value: "light", label: "Light Mode", icon: Sun },
  { value: "dark", label: "Dark Mode", icon: Moon },
  { value: "system", label: "Ikuti Sistem", icon: Laptop },
] as const;

/**
 * Section "Tampilan" (Prompt 25, bagian 2): Light / Dark / System mode.
 * Memakai `next-themes` yang sudah dipasang di `Providers` — preferensi
 * ini sengaja tersimpan di penyimpanan tema bawaan `next-themes`
 * (per-perangkat), bukan `settingsService`/IndexedDB, karena "Ikuti
 * Sistem" pada dasarnya memang preferensi tampilan perangkat, bukan data
 * pribadi yang perlu ikut berpindah lewat Backup & Restore.
 */
export function AppearanceSection() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  return (
    <section id="tampilan" aria-labelledby="tampilan-heading" className="scroll-mt-24">
      <Card>
        <CardHeader>
          <CardTitle id="tampilan-heading">Tampilan</CardTitle>
          <CardDescription>Pilih mode tampilan yang nyaman untuk Bunda.</CardDescription>
        </CardHeader>
        <CardContent>
          <div role="radiogroup" aria-label="Mode tampilan" className="grid grid-cols-3 gap-2.5">
            {THEME_OPTIONS.map((option) => {
              const Icon = option.icon;
              const isActive = mounted && theme === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={isActive}
                  onClick={() => setTheme(option.value)}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-xl border px-3 py-4 text-xs font-medium transition-colors",
                    isActive
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:bg-muted"
                  )}
                >
                  <Icon className="h-5 w-5" strokeWidth={isActive ? 2.25 : 1.75} />
                  {option.label}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
