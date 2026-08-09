"use client";

import { Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";

export interface SuggestedQuestionsProps {
  questions: string[];
  onSelect: (question: string) => void;
  /** "cards" untuk empty state (lebih besar), "chips" untuk baris ringkas di atas input. */
  variant?: "cards" | "chips";
  disabled?: boolean;
  className?: string;
}

export function SuggestedQuestions({
  questions,
  onSelect,
  variant = "chips",
  disabled,
  className,
}: SuggestedQuestionsProps) {
  if (variant === "cards") {
    return (
      <div className={cn("grid grid-cols-1 gap-2 sm:grid-cols-2", className)}>
        {questions.map((question) => (
          <button
            key={question}
            type="button"
            onClick={() => onSelect(question)}
            disabled={disabled}
            className="flex items-start gap-2 rounded-xl border border-border bg-card px-4 py-3 text-left text-sm text-foreground shadow-sm transition-colors hover:border-primary/40 hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
          >
            <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
            {question}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("flex gap-2 overflow-x-auto scrollbar-none", className)}>
      {questions.map((question) => (
        <button
          key={question}
          type="button"
          onClick={() => onSelect(question)}
          disabled={disabled}
          className="shrink-0 whitespace-nowrap rounded-full border border-border bg-card px-3.5 py-1.5 text-xs text-foreground shadow-sm transition-colors hover:border-primary/40 hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
        >
          {question}
        </button>
      ))}
    </div>
  );
}
