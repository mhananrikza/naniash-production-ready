"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";

export type NaniashPose = "default" | "wave" | "book" | "chat";

export interface NaniashCharacterProps {
  pose?: NaniashPose;
  size?: number;
  animated?: boolean;
  className?: string;
}

/**
 * Naniash — karakter utama produk, digambarkan sebagai makhluk cahaya
 * (bentuk "sparkle" empat mata angin) supaya konsisten dengan tema
 * "hadiah dari langit". Satu bentuk inti dipakai ulang di semua pose;
 * aksesori (tangan melambai, buku doa, gelembung obrolan AI) ditambahkan
 * per konteks slide onboarding.
 *
 * Semua warna diambil literal dari skala di tailwind.config.ts supaya
 * ilustrasi tetap konsisten walau tema light/dark berganti.
 */
export function NaniashCharacter({
  pose = "default",
  size = 160,
  animated = true,
  className,
}: NaniashCharacterProps) {
  const uid = React.useId().replace(/:/g, "");
  const prefersReducedMotion = useReducedMotion();
  const isAnimated = animated && !prefersReducedMotion;

  const fillBoxOrigin: React.CSSProperties = {
    transformBox: "fill-box",
    transformOrigin: "center",
  };

  return (
    <motion.div
      className={cn("inline-block select-none", className)}
      style={{ width: size, height: size * (240 / 220) }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={
        isAnimated
          ? { opacity: 1, scale: 1, y: [0, -8, 0] }
          : { opacity: 1, scale: 1 }
      }
      transition={
        isAnimated
          ? {
              opacity: { duration: 0.5 },
              scale: { duration: 0.5 },
              y: { duration: 3.4, repeat: Infinity, ease: "easeInOut" },
            }
          : { duration: 0.4 }
      }
    >
      <svg
        viewBox="0 0 220 240"
        width="100%"
        height="100%"
        role="img"
        aria-label="Naniash, sobat cahaya Bunda"
      >
        <defs>
          <radialGradient id={`glow-${uid}`}>
            <stop offset="0%" stopColor="#E7A94C" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#E7A94C" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={`body-${uid}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#F0C784" />
            <stop offset="55%" stopColor="#E7A94C" />
            <stop offset="100%" stopColor="#CE8F35" />
          </linearGradient>
          <filter id={`shadow-${uid}`} x="-40%" y="-40%" width="180%" height="180%">
            <feDropShadow dx="0" dy="5" stdDeviation="7" floodColor="#332B57" floodOpacity="0.28" />
          </filter>
        </defs>

        {/* Aura halo — hanya untuk pose "chat", menandakan kehadiran AI */}
        {pose === "chat" && (
          <motion.circle
            cx={110}
            cy={110}
            r={98}
            fill="none"
            stroke="#F0C784"
            strokeWidth={2}
            strokeDasharray="3 8"
            strokeLinecap="round"
            opacity={0.55}
            style={fillBoxOrigin}
            animate={isAnimated ? { rotate: 360 } : undefined}
            transition={isAnimated ? { duration: 22, repeat: Infinity, ease: "linear" } : undefined}
          />
        )}

        {/* Cahaya belakang */}
        <circle cx={110} cy={112} r={95} fill={`url(#glow-${uid})`} />

        {/* Badan — bentuk sparkle empat mata angin */}
        <path
          d="M110 30 C120 80 140 100 190 110 C140 120 120 140 110 190 C100 140 80 120 30 110 C80 100 100 80 110 30 Z"
          fill={`url(#body-${uid})`}
          stroke="#463C82"
          strokeOpacity={0.15}
          strokeWidth={1.5}
          filter={`url(#shadow-${uid})`}
        />

        {/* Wajah */}
        <motion.g
          style={fillBoxOrigin}
          animate={isAnimated ? { scaleY: [1, 1, 0.12, 1, 1] } : undefined}
          transition={
            isAnimated
              ? { duration: 4.2, repeat: Infinity, times: [0, 0.86, 0.9, 0.94, 1], ease: "easeInOut" }
              : undefined
          }
        >
          <ellipse cx={92} cy={110} rx={5.5} ry={7} fill="#332B57" />
          <ellipse cx={128} cy={110} rx={5.5} ry={7} fill="#332B57" />
        </motion.g>
        <ellipse cx={80} cy={120} rx={8} ry={5} fill="#D98A94" opacity={0.6} />
        <ellipse cx={140} cy={120} rx={8} ry={5} fill="#D98A94" opacity={0.6} />
        <path
          d="M99 126 Q110 135 121 126"
          fill="none"
          stroke="#332B57"
          strokeWidth={3}
          strokeLinecap="round"
        />

        {/* Aksesori khusus pose */}
        {pose === "wave" && (
          <>
            <motion.path
              d="M182 46 C185 58 192 62 204 65 C192 68 185 72 182 84 C179 72 172 68 160 65 C172 62 179 58 182 46 Z"
              fill="#D98A94"
              style={fillBoxOrigin}
              animate={isAnimated ? { rotate: [0, 18, 0], scale: [1, 1.12, 1] } : undefined}
              transition={isAnimated ? { duration: 1.8, repeat: Infinity, ease: "easeInOut" } : undefined}
            />
            <motion.path
              d="M55 55 C57 63 62 66 70 68 C62 70 57 73 55 81 C53 73 48 70 40 68 C48 66 53 63 55 55 Z"
              fill="#F0C784"
              style={fillBoxOrigin}
              animate={isAnimated ? { rotate: [0, -14, 0], scale: [1, 1.15, 1] } : undefined}
              transition={
                isAnimated ? { duration: 1.8, repeat: Infinity, ease: "easeInOut", delay: 0.3 } : undefined
              }
            />
          </>
        )}

        {pose === "book" && (
          <g>
            <rect x={72} y={198} width={76} height={32} rx={8} fill="#4A3F7A" />
            <line x1={110} y1={200} x2={110} y2={228} stroke="#F0C784" strokeOpacity={0.6} strokeWidth={2} />
            <path
              d="M84 210 a6 6 0 0 1 12 0 a6 6 0 0 1 -6 8 a6 6 0 0 1 -6 -8 Z"
              fill="#F0C784"
              opacity={0.85}
            />
            <rect x={120} y={207} width={20} height={2.5} rx={1.25} fill="#F1EFFB" opacity={0.6} />
            <rect x={120} y={213} width={16} height={2.5} rx={1.25} fill="#F1EFFB" opacity={0.5} />
            <rect x={120} y={219} width={18} height={2.5} rx={1.25} fill="#F1EFFB" opacity={0.4} />
          </g>
        )}

        {pose === "chat" && (
          <g>
            <path d="M150 74 L140 84 L152 78 Z" fill="#FBF7F2" stroke="#E7A94C" strokeWidth={1} />
            <rect
              x={148}
              y={38}
              width={58}
              height={40}
              rx={14}
              fill="#FBF7F2"
              stroke="#E7A94C"
              strokeWidth={1.5}
            />
            {[0, 1, 2].map((i) => (
              <motion.circle
                key={i}
                cx={165 + i * 14}
                cy={58}
                r={4}
                fill="#CE8F35"
                animate={isAnimated ? { opacity: [0.25, 1, 0.25] } : undefined}
                transition={
                  isAnimated
                    ? { duration: 1.3, repeat: Infinity, ease: "easeInOut", delay: i * 0.2 }
                    : undefined
                }
              />
            ))}
          </g>
        )}
      </svg>
    </motion.div>
  );
}
