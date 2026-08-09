"use client";

import { motion } from "framer-motion";

import { JOURNAL_MOODS } from "@/config/journal";
import { cn } from "@/lib/utils";

export interface JournalMoodPickerProps {
  value: string | null;
  onChange: (label: string, emoji: string) => void;
  className?: string;
}

/** Grid 6 pilihan mood — dipakai di "Mood Hari Ini" dan dialog edit entri. */
export function JournalMoodPicker({ value, onChange, className }: JournalMoodPickerProps) {
  return (
    <div className={cn("grid grid-cols-3 gap-2 sm:grid-cols-6", className)} role="radiogroup" aria-label="Pilih mood">
      {JOURNAL_MOODS.map((mood) => {
        const isActive = value === mood.label;
        return (
          <button
            key={mood.label}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => onChange(mood.label, mood.emoji)}
            className={cn(
              "relative flex flex-col items-center gap-1 rounded-xl border px-2 py-2.5 text-center transition-colors",
              isActive
                ? "border-primary bg-primary/15 text-primary"
                : "border-border text-muted-foreground hover:bg-muted"
            )}
          >
            {isActive && (
              <motion.span
                layoutId="journal-mood-highlight"
                className="absolute inset-0 rounded-xl border border-primary"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <span className="text-xl leading-none" aria-hidden>
              {mood.emoji}
            </span>
            <span className="text-[11px] font-medium">{mood.label}</span>
          </button>
        );
      })}
    </div>
  );
}
