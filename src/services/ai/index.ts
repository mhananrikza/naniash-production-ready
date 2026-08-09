/**
 * Titik impor tunggal AI Engine. Import selalu dari sini
 * (`@/services/ai`), sama seperti pola `@/services/content` dan
 * `@/services/daily-journey`. Lihat `README.md` di folder ini untuk
 * penjelasan arsitektur lengkap (Dependency Injection, Mode Offline vs
 * Online, cara menambah provider baru).
 *
 * Pemakaian umum (di Client Component, setelah mount):
 *
 * ```ts
 * import { createDefaultAiService } from "@/services/ai";
 *
 * const ai = createDefaultAiService(); // mulai di Mode Offline
 * const reply = await ai.ask({ question: "Doa apa saat anak sakit?" });
 * // reply.content  -> teks jawaban
 * // reply.sources   -> daftar doa/artikel/afirmasi yang dipakai
 *
 * ai.setMode("online"); // nanti, setelah integrasi API terpasang
 * ```
 */

// Kontrak inti (DI seam).
export type { AiProvider } from "./provider";
export { AiService, type AiProviderRegistry } from "./ai-service";
export { createAiProviderRegistry, createDefaultAiService } from "./container";

// Tipe data bersama.
export type { AiRole, AiMessage, AiProviderMode, AiProviderInfo, AiSource, AiAskInput, AiReply } from "./types";

// Error khusus AI Engine.
export { AiError, AiProviderUnavailableError, AiNotImplementedError, AiProviderNotRegisteredError } from "./errors";

// Provider Mode Offline — diekspor juga (bukan cuma lewat container) untuk
// pemanggil yang butuh instance offline secara eksplisit (mis. pengujian).
export { OfflineAiProvider } from "./offline/offline-ai-provider";

// Provider Mode Online — Gemini 3.1 Flash-Lite lewat Netlify Function.
export { GeminiProvider, GeminiRequestError } from "./online/gemini-provider";

// Placeholder lama (belum tersambung) — tetap diekspor untuk kompatibilitas,
// TIDAK dipakai lagi oleh `container.ts`.
export { OpenAiProvider, type OpenAiProviderConfig } from "./online/openai-provider";

// Port pencarian & adapter default-nya — untuk pemanggil yang ingin
// merakit `OfflineAiProvider` sendiri dengan sumber pencarian lain.
export type { ContentSearchPort, ContentSearchHit } from "./ports/content-search.port";
export { createLocalSearchAdapter } from "./adapters/local-search.adapter";
