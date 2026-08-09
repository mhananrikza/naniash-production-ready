import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Sapaan berbasis waktu — dipakai di Header/Home untuk menyapa pengguna
 * ("Selamat pagi, Bunda" dst). Ditaruh di sini karena dipakai lintas
 * beberapa komponen di luar satu fitur saja.
 */
export function getGreeting(date: Date = new Date()): string {
  const hour = date.getHours();
  if (hour < 4) return "Selamat malam";
  if (hour < 11) return "Selamat pagi";
  if (hour < 15) return "Selamat siang";
  if (hour < 18) return "Selamat sore";
  return "Selamat malam";
}

/**
 * Format jam singkat (mis. "14.05") untuk timestamp pesan chat.
 * Dipakai di halaman AI Sobat Bunda.
 */
export function formatTime(date: Date = new Date()): string {
  return date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}
