"use client";

import { motion, useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";

export interface ProgressProps {
  /** Nilai 0–100. */
  value: number;
  className?: string;
  trackClassName?: string;
  indicatorClassName?: string;
  "aria-label"?: string;
}

/**
 * Bar progres linear tipis dengan radius penuh, dipakai di seluruh Home
 * (Progress Hari Ini, Continue Reading, Challenge 30 Hari) supaya
 * treatment progres konsisten satu sama lain.
 */
export function Progress({
  value,
  className,
  trackClassName,
  indicatorClassName,
  "aria-label": ariaLabel,
}: ProgressProps) {
  const prefersReducedMotion = useReducedMotion();
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={ariaLabel}
      className={cn("h-2 w-full overflow-hidden rounded-full bg-muted", trackClassName, className)}
    >
      <motion.div
        className={cn("h-full rounded-full bg-primary", indicatorClassName)}
        initial={{ width: prefersReducedMotion ? `${clamped}%` : 0 }}
        animate={{ width: `${clamped}%` }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      />
    </div>
  );
}
