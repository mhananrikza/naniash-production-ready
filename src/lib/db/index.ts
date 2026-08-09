/**
 * Entry point publik untuk layer database lokal (IndexedDB).
 *
 * Struktur:
 * - `database/` — koneksi & skema IndexedDB (satu-satunya yang panggil `indexedDB.open`).
 * - `repository/` — operasi CRUD per object store, tipis & tanpa logika bisnis.
 * - `services/`  — logika bisnis per domain; INI yang dipakai halaman/hook, bukan repository langsung.
 *
 * Pemakaian umum (di Client Component / hook, setelah mount):
 *
 * ```ts
 * import { favoritesService, journalService } from "@/lib/db";
 *
 * await favoritesService.toggle("article", slug);
 * const entries = await journalService.list();
 * ```
 *
 * Untuk memantau perubahan data secara reaktif (mis. dari hook custom):
 *
 * ```ts
 * import { dbEvents } from "@/lib/db";
 *
 * const unsubscribe = dbEvents.subscribe("favorites", () => {
 *   // refetch data favorit
 * });
 * ```
 *
 * Semua kode di sini hanya berjalan di browser. Jangan import modul ini
 * dari Server Component atau kode yang jalan saat build/SSR.
 */

export * from "./database";
export * from "./models";
export * from "./errors";
export { dbEvents } from "./events";
export * from "./repository";
export * from "./services";
