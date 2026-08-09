"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * Backdrop ambient — beberapa blob blur lembut yang melayang pelan,
 * dipakai di Welcome & Onboarding supaya alur pra-login terasa satu
 * kesatuan visual (bukan latar putih polos). Diletakkan absolute,
 * di belakang konten (-z-10), dan mati total saat reduced-motion aktif.
 */
export function AuroraBackdrop() {
  const prefersReducedMotion = useReducedMotion();

  const blobs = [
    { color: "#D98A94", top: "-10%", left: "-15%", size: 280, duration: 14 },
    { color: "#E7A94C", top: "55%", left: "70%", size: 240, duration: 17 },
    { color: "#8478C3", top: "5%", left: "65%", size: 200, duration: 12 },
  ];

  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden>
      {blobs.map((blob, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full blur-3xl"
          style={{
            top: blob.top,
            left: blob.left,
            width: blob.size,
            height: blob.size,
            backgroundColor: blob.color,
            opacity: 0.22,
          }}
          animate={
            prefersReducedMotion
              ? undefined
              : {
                  x: [0, 20, -10, 0],
                  y: [0, -15, 10, 0],
                }
          }
          transition={
            prefersReducedMotion
              ? undefined
              : { duration: blob.duration, repeat: Infinity, ease: "easeInOut" }
          }
        />
      ))}
    </div>
  );
}
