"use client";

import * as React from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

const DISMISS_KEY = "hdl:install-prompt-dismissed-at";
// Kalau Bunda menutup banner, jangan tampilkan lagi selama 14 hari —
// cukup memberi kesempatan, tidak mengganggu.
const DISMISS_COOLDOWN_MS = 14 * 24 * 60 * 60 * 1000;

function isStandaloneDisplay(): boolean {
  if (typeof window === "undefined") return false;
  const isDisplayModeStandalone = window.matchMedia?.("(display-mode: standalone)").matches;
  // iOS Safari tidak punya `display-mode: standalone` yang konsisten;
  // gunakan properti non-standar `navigator.standalone` sebagai fallback.
  const isIosStandalone = (window.navigator as unknown as { standalone?: boolean }).standalone;
  return Boolean(isDisplayModeStandalone || isIosStandalone);
}

function isIosSafari(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  const isIos = /iphone|ipad|ipod/i.test(ua);
  const isSafari = /safari/i.test(ua) && !/crios|fxios|edgios/i.test(ua);
  return isIos && isSafari;
}

function wasRecentlyDismissed(): boolean {
  try {
    const raw = window.localStorage.getItem(DISMISS_KEY);
    if (!raw) return false;
    return Date.now() - Number(raw) < DISMISS_COOLDOWN_MS;
  } catch {
    return false;
  }
}

/**
 * Menangkap event `beforeinstallprompt` (Chrome/Edge/Android) dan
 * membedakan kasus iOS Safari, yang tidak mendukung event tersebut sama
 * sekali — di sana instalasi hanya bisa lewat menu "Bagikan -> Tambah ke
 * Layar Utama" secara manual, jadi kita tampilkan instruksinya sendiri.
 */
export function useInstallPrompt() {
  const deferredPromptRef = React.useRef<BeforeInstallPromptEvent | null>(null);
  const [canInstall, setCanInstall] = React.useState(false);
  const [showIosHint, setShowIosHint] = React.useState(false);
  const [justInstalled, setJustInstalled] = React.useState(false);

  React.useEffect(() => {
    if (isStandaloneDisplay() || wasRecentlyDismissed()) return;

    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      deferredPromptRef.current = event as BeforeInstallPromptEvent;
      setCanInstall(true);
    }

    function handleAppInstalled() {
      deferredPromptRef.current = null;
      setCanInstall(false);
      setShowIosHint(false);
      setJustInstalled(true);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    if (isIosSafari()) {
      setShowIosHint(true);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const promptInstall = React.useCallback(async () => {
    const deferredPrompt = deferredPromptRef.current;
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    deferredPromptRef.current = null;
    setCanInstall(false);

    if (outcome === "accepted") {
      setJustInstalled(true);
    }
  }, []);

  const dismiss = React.useCallback(() => {
    setCanInstall(false);
    setShowIosHint(false);
    try {
      window.localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      // Abaikan — banner cukup tersembunyi untuk sesi ini saja.
    }
  }, []);

  return {
    canInstall,
    showIosHint,
    justInstalled,
    promptInstall,
    dismiss,
  } as const;
}
