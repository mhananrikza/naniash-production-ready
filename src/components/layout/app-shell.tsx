"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { BottomNav } from "@/components/layout/bottom-nav";

interface AppShellProps {
  children: React.ReactNode;
}

/**
 * Kerangka utama aplikasi setelah login: Header + Sidebar (desktop/tablet)
 * + BottomNav (mobile) + area konten yang bertransisi halus antar rute.
 * Dipakai oleh src/app/(app)/layout.tsx.
 */
export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="flex min-h-dvh flex-col">
      <Header />
      <div className="container flex flex-1 gap-8">
        <Sidebar />
        <main className="min-w-0 flex-1 pb-[calc(4.5rem+max(0.75rem,env(safe-area-inset-bottom)))] pt-6 md:pb-10">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={pathname}
              initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={shouldReduceMotion ? undefined : { opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
