import type { AiAskInput, AiProviderInfo, AiReply } from "./types";

/**
 * Kontrak utama yang WAJIB dipenuhi setiap provider AI — Mode Offline
 * (`offline/offline-ai-provider.ts`), Mode Online (`online/openai-provider.ts`),
 * atau provider lain di masa depan (Claude, Gemini, model lokal, dsb).
 *
 * Ini adalah SATU-SATUNYA titik ketergantungan `AiService` (lihat
 * `ai-service.ts`) terhadap "AI" — `AiService` hanya pernah memanggil
 * method di interface ini, tidak pernah tahu apakah jawaban datang dari
 * pencarian Markdown lokal atau dari panggilan API sungguhan ke OpenAI.
 * Mengganti/menambah provider = membuat class baru yang mengimplementasi
 * `AiProvider`, lalu men-`inject`-kannya lewat `container.ts` — tidak ada
 * baris kode di `AiService` maupun pemanggilnya (chat page, dsb) yang
 * perlu berubah sama sekali.
 */
export interface AiProvider {
  /** Identitas provider ini — dibaca `AiService.getProviderInfo()` untuk keperluan tampilan/diagnostik. */
  readonly info: AiProviderInfo;

  /**
   * `true` bila provider ini SIAP dipakai saat ini. Dicek `AiService`
   * sebelum memanggil `ask()`, supaya kegagalan (mis. index pencarian
   * offline belum terbangun, atau API key online belum diisi) terdeteksi
   * lebih awal & jelas — bukan gagal di tengah-tengah `ask()`.
   */
  isAvailable(): Promise<boolean>;

  /**
   * Jawab satu pertanyaan. Wajib melempar error (bukan diam-diam
   * mengembalikan jawaban kosong) bila gagal — `AiService` yang
   * memutuskan cara menampilkan/menangani kegagalan itu ke pemanggil.
   */
  ask(input: AiAskInput): Promise<AiReply>;
}
