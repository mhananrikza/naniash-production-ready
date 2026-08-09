"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";

export interface RevealProps {
  children: React.ReactNode;
  /** Urutan delay dalam stagger, dikalikan 0.06s. */
  index?: number;
  className?: string;
}

/**
 * Bungkus tiap section Home dengan fade+slide-up halus, di-stagger lewat
 * `index`. Dipisah dari tiap komponen supaya efek reveal konsisten tanpa
 * mengulang boilerplate motion di setiap file.
 */
export function Reveal({ children, index = 0, className }: RevealProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={prefersReducedMotion ? undefined : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut", delay: prefersReducedMotion ? 0 : index * 0.06 }}
    >
      {children}
    </motion.div>
  );
}
