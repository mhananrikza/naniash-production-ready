"use client";

import { Heart } from "lucide-react";

import { cn } from "@/lib/utils";

export interface FavoriteButtonProps {
  active: boolean;
  onToggle: () => void;
  size?: "sm" | "md";
  className?: string;
}

/**
 * Tombol hati bulat untuk toggle favorit — dipakai di kartu artikel dan
 * header halaman detail. `stopPropagation` supaya tidak ikut memicu
 * navigasi `Link` saat dipakai di dalam kartu yang bisa diklik.
 */
export function FavoriteButton({ active, onToggle, size = "sm", className }: FavoriteButtonProps) {
  return (
    <button
      type="button"
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onToggle();
      }}
      aria-pressed={active}
      aria-label={active ? "Hapus dari favorit" : "Tambahkan ke favorit"}
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full border transition-colors",
        "bg-background/90 backdrop-blur hover:border-destructive/40 hover:text-destructive",
        size === "sm" ? "h-8 w-8" : "h-10 w-10",
        active ? "border-destructive/40 text-destructive" : "border-border text-muted-foreground",
        className
      )}
    >
      <Heart
        className={cn(size === "sm" ? "h-4 w-4" : "h-5 w-5")}
        strokeWidth={1.75}
        fill={active ? "currentColor" : "none"}
      />
    </button>
  );
}
