import { Naniash } from "@/components/naniash/naniash";

export function JournalEmptyState() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border py-10 text-center">
      <Naniash pose="journaling" size={96} />
      <p className="mx-auto max-w-xs text-sm leading-relaxed text-muted-foreground">
        Belum ada cerita yang disimpan. Mungkin hari ini bisa menjadi awalnya. 🌷
      </p>
    </div>
  );
}
