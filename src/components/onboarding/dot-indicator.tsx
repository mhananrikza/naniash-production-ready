"use client";

import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

interface DotIndicatorProps {
  count: number;
  activeIndex: number;
  className?: string;
}

export function DotIndicator({ count, activeIndex, className }: DotIndicatorProps) {
  return (
    <div className={cn("flex items-center justify-center gap-2", className)} role="presentation">
      {Array.from({ length: count }).map((_, i) => {
        const isActive = i === activeIndex;
        return (
          <motion.span
            key={i}
            className={cn("h-2 rounded-full", isActive ? "bg-primary" : "bg-muted-foreground/25")}
            animate={{ width: isActive ? 24 : 8 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          />
        );
      })}
    </div>
  );
}
