"use client";

import * as React from "react";
import { Heart } from "lucide-react";

import { cn } from "@/lib/utils";
import { afirmasiCategories } from "@/config/afirmasi";

export const ALL_AFIRMASI_CATEGORY_SLUG = "semua";

export interface AfirmasiCategoryFilterProps {
  selected: string;
  onSelect: (slug: string) => void;
  showFavoritesOnly: boolean;
  onToggleFavoritesOnly: () => void;
  className?: string;
}

export function AfirmasiCategoryFilter({
  selected,
  onSelect,
  showFavoritesOnly,
  onToggleFavoritesOnly,
  className,
}: AfirmasiCategoryFilterProps) {
  return (
    <div className={cn("flex gap-2 overflow-x-auto scrollbar-none pb-1", className)}>
      <Chip active={selected === ALL_AFIRMASI_CATEGORY_SLUG} onClick={() => onSelect(ALL_AFIRMASI_CATEGORY_SLUG)}>
        Semua
      </Chip>

      {afirmasiCategories.map((category) => {
        const Icon = category.icon;
        return (
          <Chip key={category.slug} active={selected === category.slug} onClick={() => onSelect(category.slug)}>
            <Icon className="h-3.5 w-3.5" />
            {category.name}
          </Chip>
        );
      })}

      <span className="mx-0.5 my-1 w-px shrink-0 bg-border" aria-hidden />

      <Chip active={showFavoritesOnly} onClick={onToggleFavoritesOnly} tone="accent">
        <Heart className="h-3.5 w-3.5" fill={showFavoritesOnly ? "currentColor" : "none"} />
        Favorit
      </Chip>
    </div>
  );
}

interface ChipProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  tone?: "default" | "accent";
}

function Chip({ active, onClick, children, tone = "default" }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 py-2 text-xs font-medium transition-colors",
        active
          ? tone === "accent"
            ? "border-destructive/30 bg-destructive/10 text-destructive"
            : "border-primary/30 bg-primary/15 text-primary"
          : "border-border bg-card text-muted-foreground hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}
