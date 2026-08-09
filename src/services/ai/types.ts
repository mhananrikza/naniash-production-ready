/**
 * Tipe bersama AI Engine (`@/services/ai`). Dipakai `provider.ts`
 * (kontrak `AiProvider`), `ai-service.ts` (facade), serta implementasi
 * provider (`offline/`, `online/`) — satu-satunya tempat bentuk data
 * `AiAskInput`/`AiReply` didefinisikan supaya seluruh lapisan sepakat.
 */

import type { ContentType } from "@/types/content";

export type AiRole = "user" | "assistant" | "system";

export interface AiMessage {
  role: AiRole;
  content: string;
}

export type AiProviderMode = "offline" | "online";

/** Identitas satu provider — ditampilkan apa adanya bila pemanggil (nanti: UI) perlu menunjukkan mode/provider yang sedang aktif. */
export interface AiProviderInfo {
  /** Id unik provider, mis. "offline-search" atau "openai". */
  id: string;
  mode: AiProviderMode;
  /** Label ramah-manusia, mis. "Pencarian Offline" atau "OpenAI GPT-4o". */
  label: string;
}

/**
 * Materi (doa/dzikir/afirmasi/artikel) yang dipakai provider untuk
 * menyusun jawaban. Mode Offline mengisi ini dari hasil Search Engine
 * lokal; Mode Online nanti mengisi dari dokumen retrieval/citation
 * provider tsb — bentuknya sengaja sama supaya pemanggil tidak perlu tahu
 * bedanya provider mana yang menjawab.
 */
export interface AiSource {
  type: ContentType;
  slug: string;
  title: string;
  excerpt: string;
  /** Skor relevansi provider tsb, semakin besar semakin relevan. Skalanya boleh beda antar provider — jangan dibandingkan lintas provider. */
  score?: number;
}

export interface AiAskInput {
  /** Pertanyaan/pesan terbaru dari pengguna — SUDAH di-trim oleh `AiService.ask()` sebelum sampai ke provider. */
  question: string;
  /**
   * Riwayat percakapan sebelumnya, opsional. Provider Offline saat ini
   * mengabaikannya (pencarian per pertanyaan berdiri sendiri, tanpa
   * memori); provider Online nanti akan memakainya sebagai context
   * window ke LLM.
   */
  history?: AiMessage[];
}

export interface AiReply {
  content: string;
  sources: AiSource[];
  providerId: string;
  mode: AiProviderMode;
}
