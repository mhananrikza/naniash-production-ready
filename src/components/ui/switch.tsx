"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";

export interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  id?: string;
  className?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
}

/**
 * Toggle switch ringan buatan sendiri — pola sama dengan `dialog.tsx`
 * (bukan @radix-ui/react-switch, dependency itu tidak terpasang di
 * proyek ini). API meniru `checked`/`onCheckedChange` ala shadcn/Radix
 * supaya terasa familiar.
 */
export const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({ checked, onCheckedChange, disabled, id, className, ...aria }, ref) => {
    const prefersReducedMotion = useReducedMotion();

    return (
      <button
        ref={ref}
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onCheckedChange(!checked)}
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
          checked ? "bg-primary" : "bg-muted",
          className
        )}
        {...aria}
      >
        <motion.span
          className="inline-block h-5 w-5 rounded-full bg-background shadow-sm"
          animate={{ x: checked ? 20 : 2 }}
          transition={prefersReducedMotion ? { duration: 0 } : { type: "spring", stiffness: 500, damping: 30 }}
        />
      </button>
    );
  }
);
Switch.displayName = "Switch";
