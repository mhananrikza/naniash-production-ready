/** Membuat id unik untuk record baru. */
export function createId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  // Fallback untuk lingkungan tanpa crypto.randomUUID (mis. Safari lama/non-HTTPS).
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Timestamp ISO untuk field `createdAt`/`updatedAt`. */
export function nowIso(): string {
  return new Date().toISOString();
}

/**
 * Kunci tanggal `YYYY-MM-DD` berbasis waktu lokal perangkat (bukan UTC),
 * supaya "hari ini" konsisten dengan zona waktu pengguna. Dipakai sebagai
 * id record di store `progress` dan default tanggal di `journal`.
 */
export function todayDateKey(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
