import Link from "next/link";

import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getGreeting } from "@/lib/utils";
import { siteConfig } from "@/config/site";

/**
 * Header aplikasi.
 * Strip gradasi tipis di bagian paling atas adalah elemen signature —
 * jejak "langit senja" yang menaungi seluruh shell, konsisten di light/dark.
 * Titik kecil di sebelah wordmark merepresentasikan kehadiran Naniash
 * (statis di Phase 1, akan "berkedip" via animate-berkelip setelah AI aktif).
 */
export function Header() {
  const greeting = getGreeting();

  return (
    <header className="sticky top-0 z-40 w-full">
      <div className="h-1 w-full bg-gradient-langit" aria-hidden />
      <div className="border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-cahaya-500 animate-berkelip" />
            </span>
            <span className="font-display text-lg font-semibold tracking-tight text-foreground">
              {siteConfig.name}
            </span>
          </Link>

          <div className="hidden items-center gap-1 text-sm text-muted-foreground md:flex">
            <span>{greeting}, Bunda</span>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              href="/settings"
              aria-label="Pengaturan"
              className="rounded-full transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <Avatar>
                <AvatarFallback>B</AvatarFallback>
              </Avatar>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
