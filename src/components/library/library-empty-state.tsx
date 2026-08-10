import { SearchX } from "lucide-react";

import { Naniash } from "@/components/naniash/naniash";

export interface LibraryEmptyStateProps {
  onReset?: () => void;
}

export function LibraryEmptyState({ onReset }: LibraryEmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-langit-100 bg-langit-50/40 py-12 text-center">
      <Naniash pose="reflection" size={88} decorative />
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <SearchX className="h-4 w-4" aria-hidden />
      </span>
      <div className="space-y-1 px-6">
        <p className="font-display text-sm font-medium text-foreground">Materi tidak ditemukan</p>
        <p className="mx-auto max-w-xs text-xs text-muted-foreground">
          Coba kata kunci lain, atau ubah kategori dan filter untuk melihat materi lainnya.
        </p>
      </div>
      {onReset && (
        <button
          type="button"
          onClick={onReset}
          className="text-xs font-medium text-primary underline-offset-2 hover:underline"
        >
          Reset pencarian &amp; filter
        </button>
      )}
    </div>
  );
}
