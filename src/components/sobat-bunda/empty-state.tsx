import { Naniash } from "@/components/naniash/naniash";
import { SuggestedQuestions } from "@/components/sobat-bunda/suggested-questions";
import { siteConfig } from "@/config/site";

export interface EmptyStateProps {
  questions: string[];
  onSelect: (question: string) => void;
}

/**
 * Tampilan saat belum ada satu pun pesan — memperkenalkan Naniash dan
 * langsung menawarkan pertanyaan siap pakai, supaya Bunda tidak
 * menghadapi kolom input kosong tanpa arah.
 */
export function EmptyState({ questions, onSelect }: EmptyStateProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-5 px-4 py-8 text-center">
      <Naniash pose="ai" size={104} />

      <div className="space-y-1.5">
        <p className="font-display text-lg font-medium text-foreground">
          Assalamu&apos;alaikum, Bunda 👋
        </p>
        <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
          Aku {siteConfig.companion.name}, {siteConfig.companion.tagline}. Tanya apa saja seputar doa,
          tirakat, atau sekadar cerita — aku di sini menemani.
        </p>
      </div>

      <div className="w-full max-w-sm space-y-2 pt-1">
        <p className="text-left text-xs font-medium text-muted-foreground">Coba tanya:</p>
        <SuggestedQuestions questions={questions} onSelect={onSelect} variant="cards" />
      </div>
    </div>
  );
}
