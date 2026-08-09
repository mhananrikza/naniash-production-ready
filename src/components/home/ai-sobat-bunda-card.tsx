import Link from "next/link";
import { ArrowUp, Sparkles } from "lucide-react";

import { Naniash } from "@/components/naniash/naniash";
import { siteConfig } from "@/config/site";
import { aiSobatBundaContent } from "@/config/home";

/**
 * Promo "AI Sobat Bunda" — dibuat menyerupai input chat yang belum aktif
 * (bukan tombol CTA biasa) supaya afordansinya jelas: ini pintu masuk ke
 * percakapan dengan Naniash, bukan sekadar tautan info.
 */
export function AiSobatBundaCard() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-nur-500/10 blur-2xl"
        aria-hidden
      />

      <div className="relative flex items-center gap-3">
        <Naniash pose="ai" size={52} className="shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1 text-xs font-medium text-nur-500">
            <Sparkles className="h-3.5 w-3.5" />
            Temani aku bersama {siteConfig.companion.name}
          </p>
          <p className="truncate font-display text-sm font-medium text-foreground">
            {aiSobatBundaContent.greeting}
          </p>
        </div>
      </div>

      <Link
        href="/sobat-bunda"
        className="relative mt-4 flex w-full items-center justify-between gap-3 rounded-full border border-border bg-muted px-4 py-3 text-left text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:bg-muted/70"
      >
        <span className="truncate">Berbicara dengan Naniash</span>
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <ArrowUp className="h-3.5 w-3.5" strokeWidth={2.5} />
        </span>
      </Link>
    </div>
  );
}
