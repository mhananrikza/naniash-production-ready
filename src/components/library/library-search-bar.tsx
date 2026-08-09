"use client";

import { Search, X } from "lucide-react";

import { cn } from "@/lib/utils";

export interface LibrarySearchBarProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function LibrarySearchBar({ value, onChange, className }: LibrarySearchBarProps) {
  return (
    <div className={cn("relative", className)}>
      <Search
        className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <input
        type="search"
        inputMode="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Cari materi, doa, atau topik…"
        aria-label="Cari materi Perpustakaan"
        className={cn(
          "h-11 w-full rounded-xl border border-border bg-card pl-10 pr-10 text-sm text-foreground shadow-sm outline-none transition-colors",
          "placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-ring/40"
        )}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Bersihkan pencarian"
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground transition-colors hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
