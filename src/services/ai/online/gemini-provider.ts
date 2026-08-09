import type { AiProvider } from "../provider";
import type { AiAskInput, AiMessage, AiProviderInfo, AiReply, AiSource } from "../types";
import type { ContentSearchHit, ContentSearchPort } from "../ports/content-search.port";
import { AiError } from "../errors";

/** Berapa hasil maksimum diambil per kategori untuk dijadikan context ke Gemini — dijaga kecil (lihat "API EFFICIENCY": batasi context knowledge base). */
const RESULTS_PER_CATEGORY = 2;

/** Berapa pesan riwayat terakhir yang ikut dikirim sebagai context percakapan — dijaga pendek untuk hemat token/free tier. */
const MAX_HISTORY_MESSAGES = 6;

/** Endpoint Netlify Function — satu-satunya tempat client bicara ke "AI online". Tidak pernah memanggil Gemini langsung dari browser. */
const ENDPOINT = "/.netlify/functions/naniash-chat";

function toSource(hit: ContentSearchHit): AiSource {
  return {
    type: hit.type,
    slug: hit.slug,
    title: hit.title,
    excerpt: hit.excerpt,
    score: hit.score,
  };
}

/** Error khusus: request ke Netlify Function/Gemini gagal (network, quota, dsb). Pemanggil (halaman chat) memakai ini untuk memutuskan jatuh ke Mode Offline. */
export class GeminiRequestError extends AiError {
  constructor(
    message: string,
    public readonly reason: "network" | "quota" | "server" | "unknown" = "unknown"
  ) {
    super(message);
    this.name = "GeminiRequestError";
  }
}

interface NaniashChatResponseBody {
  content?: string;
  error?: string;
  reason?: "quota" | "server";
}

/**
 * Mode Online — memanggil Gemini 3.1 Flash-Lite lewat Netlify Function
 * `naniash-chat` (lihat `netlify/functions/naniash-chat.ts`). API key
 * `GEMINI_API_KEY` HANYA ada sebagai environment variable di Netlify;
 * file ini tidak pernah menyentuhnya.
 *
 * Alur Local-First (lihat PROMPT 26): sebelum memanggil Gemini, provider
 * ini mencari materi relevan lewat `ContentSearchPort` yang sama dipakai
 * `OfflineAiProvider` — HANYA cuplikan materi paling relevan yang dikirim
 * sebagai context, bukan seluruh knowledge base.
 */
export class GeminiProvider implements AiProvider {
  readonly info: AiProviderInfo = {
    id: "gemini",
    mode: "online",
    label: "Naniash Online (Gemini)",
  };

  constructor(private readonly contentSearch: ContentSearchPort) {}

  /**
   * Tidak memanggil network sama sekali di sini — hanya mengecek sinyal
   * koneksi browser. Kegagalan sungguhan (fetch gagal, quota habis) baru
   * terjadi & ditangani di `ask()`, supaya `isAvailable()` tetap murah dan
   * bisa dipanggil sesering yang dibutuhkan UI (mis. tiap render status).
   */
  async isAvailable(): Promise<boolean> {
    if (typeof navigator === "undefined" || typeof navigator.onLine !== "boolean") return true;
    return navigator.onLine;
  }

  async ask(input: AiAskInput): Promise<AiReply> {
    const { question, history } = input;

    const [doa, artikel, afirmasi] = await Promise.all([
      this.contentSearch.searchDoa(question, RESULTS_PER_CATEGORY),
      this.contentSearch.searchArtikel(question, RESULTS_PER_CATEGORY),
      this.contentSearch.searchAfirmasi(question, RESULTS_PER_CATEGORY),
    ]);

    const hits = [...doa, ...artikel, ...afirmasi];
    const trimmedHistory = trimHistory(history);

    let response: Response;
    try {
      response = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          history: trimmedHistory,
          context: hits.map((hit) => ({
            type: hit.type,
            title: hit.title,
            // Cuplikan saja, bukan isi penuh — batasi panjang context yang dikirim.
            excerpt: hit.excerpt.slice(0, 400),
          })),
        }),
      });
    } catch {
      throw new GeminiRequestError(
        "Tidak bisa menghubungi Naniash Online saat ini. Periksa koneksi internet, ya.",
        "network"
      );
    }

    if (response.status === 429) {
      throw new GeminiRequestError(
        "Kuota Naniash Online untuk saat ini sudah habis. Naniash akan menjawab dari materi offline dulu, ya.",
        "quota"
      );
    }

    if (!response.ok) {
      let reason: "server" | "unknown" = "unknown";
      try {
        const body = (await response.json()) as NaniashChatResponseBody;
        if (body.reason === "quota") {
          throw new GeminiRequestError(
            "Kuota Naniash Online untuk saat ini sudah habis. Naniash akan menjawab dari materi offline dulu, ya.",
            "quota"
          );
        }
        reason = body.reason === "server" ? "server" : "unknown";
      } catch {
        // body bukan JSON valid — abaikan, pakai pesan generik di bawah.
      }
      throw new GeminiRequestError("Naniash Online sedang bermasalah. Coba lagi sebentar lagi, ya.", reason);
    }

    const body = (await response.json()) as NaniashChatResponseBody;
    if (!body.content) {
      throw new GeminiRequestError("Naniash Online tidak memberi jawaban. Coba lagi sebentar lagi, ya.", "server");
    }

    return {
      content: body.content,
      sources: hits.map(toSource),
      providerId: this.info.id,
      mode: this.info.mode,
    };
  }
}

function trimHistory(history?: AiMessage[]): AiMessage[] {
  if (!history || history.length === 0) return [];
  return history.slice(-MAX_HISTORY_MESSAGES);
}
