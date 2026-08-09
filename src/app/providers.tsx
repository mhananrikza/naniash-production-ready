"use client";

import * as React from "react";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { ServiceWorkerRegister } from "@/components/pwa/service-worker-register";
import { InstallPrompt } from "@/components/pwa/install-prompt";
import { SearchIndexInitializer } from "@/components/search/search-index-initializer";
import { ReminderEngineInitializer } from "@/components/reminder/reminder-engine-initializer";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
      {/* Registrasi service worker + banner instal PWA — tidak me-render
          apa pun sampai kondisinya relevan (SW update tersedia / app
          belum terinstal), jadi aman dipasang global di sini. */}
      <ServiceWorkerRegister />
      <InstallPrompt />
      {/* Bangun/pastikan index Search Engine lokal siap di IndexedDB —
          tidak me-render apa pun, lihat komponennya untuk detail. */}
      <SearchIndexInitializer />
      {/* Pasang jadwal Reminder Engine (reminder pagi/malam) — lihat
          komponennya untuk detail. */}
      <ReminderEngineInitializer />
    </ThemeProvider>
  );
}
