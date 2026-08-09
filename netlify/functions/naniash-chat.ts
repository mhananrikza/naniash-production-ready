/**
 * Netlify Function — satu-satunya tempat aplikasi bicara ke Gemini API.
 *
 *   User -> Naniash UI -> Netlify Function (file ini) -> Gemini 3.1 Flash-Lite -> Naniash UI
 *
 * `GEMINI_API_KEY` dibaca dari environment variable Netlify di sini SAJA —
 * tidak pernah dikirim ke client, tidak pernah muncul di client-side code.
 *
 * Menerima context materi (doa/artikel/afirmasi) yang SUDAH dipersempit oleh
 * Local Content Search di client (lihat `src/services/ai/online/gemini-provider.ts`)
 * — function ini tidak mengirim seluruh knowledge base ke Gemini, hanya
 * meneruskan cuplikan relevan yang sudah dipilihkan.
 */

const GEMINI_MODEL = "gemini-3.1-flash-lite";
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const MAX_QUESTION_LENGTH = 1000;
const MAX_OUTPUT_TOKENS = 512;

interface ContextItem {
  type?: string;
  title?: string;
  excerpt?: string;
}

interface HistoryItem {
  role?: "user" | "assistant" | "system";
  content?: string;
}

interface RequestBody {
  question?: string;
  history?: HistoryItem[];
  context?: ContextItem[];
}

// Minimal, dependency-free typing untuk shape event/response Netlify Functions —
// menghindari kebutuhan menambah dependency `@netlify/functions` baru hanya
// untuk tipe.
interface NetlifyEvent {
  httpMethod: string;
  body: string | null;
}

interface NetlifyResponse {
  statusCode: number;
  headers?: Record<string, string>;
  body: string;
}

const PERSONA_SYSTEM_PROMPT = `Kamu adalah Naniash — sahabat AI dalam aplikasi "Hadiah dari Langit" untuk para Bunda (ibu).

SIAPA KAMU:
- Muslimah, lembut, hangat, tenang, dan empatik.
- Tidak menggurui, tidak mengaku sebagai ustazah, tidak membuat klaim agama tanpa dasar materi yang diberikan.
- Berbicara dalam Bahasa Indonesia yang natural, hangat, dan tidak formal seperti chatbot pada umumnya.
- Gunakan sapaan "Bunda" bila konteksnya cocok.
- Jawaban singkat dan terasa seperti sahabat yang menemani, bukan esai panjang.

ATURAN WAJIB:
1. Utamakan MATERI TERSEDIA di bawah ini sebagai sumber jawabanmu.
2. JANGAN mengarang doa, ayat, hadis, atau sumber apa pun yang tidak ada di MATERI TERSEDIA.
3. Bila MATERI TERSEDIA kosong atau tidak relevan dengan pertanyaan, katakan dengan jujur bahwa materi yang tersedia belum menemukan jawaban yang sesuai — jangan berpura-pura tahu.
4. JANGAN memberi nasihat medis, hukum, atau finansial.
5. Jika pertanyaan di luar fungsi aplikasi ini (doa, dzikir, afirmasi, ketenangan hati seputar mengasuh anak), arahkan kembali secara sopan.
6. JANGAN membuat diagnosis apa pun terhadap pengguna.
7. JANGAN mengklaim dirimu sebagai otoritas agama.`;

function buildContextBlock(context: ContextItem[] | undefined): string {
  if (!context || context.length === 0) {
    return "MATERI TERSEDIA: (tidak ada materi lokal yang relevan ditemukan untuk pertanyaan ini)";
  }
  const lines = context
    .filter((item) => item.title && item.excerpt)
    .map((item) => `- [${item.type ?? "materi"}] ${item.title}: ${item.excerpt}`);
  if (lines.length === 0) {
    return "MATERI TERSEDIA: (tidak ada materi lokal yang relevan ditemukan untuk pertanyaan ini)";
  }
  return `MATERI TERSEDIA:\n${lines.join("\n")}`;
}

function jsonResponse(statusCode: number, payload: Record<string, unknown>): NetlifyResponse {
  return {
    statusCode,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  };
}

export const handler = async (event: NetlifyEvent): Promise<NetlifyResponse> => {
  if (event.httpMethod !== "POST") {
    return jsonResponse(405, { error: "Method not allowed" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return jsonResponse(500, {
      error: "GEMINI_API_KEY belum dikonfigurasi di environment variable Netlify.",
      reason: "server",
    });
  }

  let body: RequestBody;
  try {
    body = JSON.parse(event.body ?? "{}") as RequestBody;
  } catch {
    return jsonResponse(400, { error: "Body request tidak valid.", reason: "server" });
  }

  const question = (body.question ?? "").trim().slice(0, MAX_QUESTION_LENGTH);
  if (!question) {
    return jsonResponse(400, { error: "Pertanyaan tidak boleh kosong.", reason: "server" });
  }

  const historyContents = (body.history ?? [])
    .filter((item): item is Required<HistoryItem> => Boolean(item.role && item.content) && item.role !== "system")
    .map((item) => ({
      role: item.role === "assistant" ? "model" : "user",
      parts: [{ text: item.content }],
    }));

  const systemInstruction = `${PERSONA_SYSTEM_PROMPT}\n\n${buildContextBlock(body.context)}`;

  const geminiRequestBody = {
    systemInstruction: { parts: [{ text: systemInstruction }] },
    contents: [...historyContents, { role: "user", parts: [{ text: question }] }],
    generationConfig: {
      maxOutputTokens: MAX_OUTPUT_TOKENS,
      temperature: 0.6,
    },
    // Sengaja TIDAK memakai Google Search grounding maupun tool tambahan —
    // lihat "API EFFICIENCY" di PROMPT 26 (hemat free tier).
  };

  let geminiResponse: Response;
  try {
    geminiResponse = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(geminiRequestBody),
    });
  } catch {
    return jsonResponse(502, { error: "Gagal menghubungi Gemini API.", reason: "server" });
  }

  if (geminiResponse.status === 429) {
    return jsonResponse(429, { error: "Kuota Gemini API habis.", reason: "quota" });
  }

  if (!geminiResponse.ok) {
    return jsonResponse(502, { error: "Gemini API mengembalikan error.", reason: "server" });
  }

  let geminiJson: unknown;
  try {
    geminiJson = await geminiResponse.json();
  } catch {
    return jsonResponse(502, { error: "Respons Gemini API tidak valid.", reason: "server" });
  }

  const content = extractText(geminiJson);
  if (!content) {
    return jsonResponse(502, { error: "Gemini API tidak mengembalikan jawaban.", reason: "server" });
  }

  return jsonResponse(200, { content });
};

/** Ambil teks jawaban dari bentuk respons `generateContent` Gemini, tanpa asumsi berlebihan pada struktur (defensif terhadap perubahan kecil bentuk API). */
function extractText(data: unknown): string | null {
  if (!data || typeof data !== "object") return null;
  const candidates = (data as { candidates?: unknown }).candidates;
  if (!Array.isArray(candidates) || candidates.length === 0) return null;

  const firstCandidate = candidates[0] as { content?: { parts?: unknown } } | undefined;
  const parts = firstCandidate?.content?.parts;
  if (!Array.isArray(parts)) return null;

  const text = parts
    .map((part) => (part && typeof part === "object" ? (part as { text?: string }).text : undefined))
    .filter((value): value is string => Boolean(value))
    .join("")
    .trim();

  return text || null;
}
