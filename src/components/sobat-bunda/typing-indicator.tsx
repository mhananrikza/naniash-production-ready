"use client";

import { motion, useReducedMotion } from "framer-motion";

import { ChatAvatar } from "@/components/sobat-bunda/chat-avatar";

/**
 * Indikator "Naniash sedang mengetik" — dibentuk seperti chat bubble
 * asisten supaya menyatu dengan alur pesan, bukan spinner lepas di
 * tengah layar.
 */
export function TypingIndicator() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="flex items-end gap-2">
      <ChatAvatar size={28} pose="listening" />
      <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-sm border border-border bg-card px-4 py-3.5 shadow-sm">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60"
            animate={prefersReducedMotion ? { opacity: [0.4, 1, 0.4] } : { y: [0, -4, 0] }}
            transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut", delay: i * 0.15 }}
          />
        ))}
      </div>
    </div>
  );
}
