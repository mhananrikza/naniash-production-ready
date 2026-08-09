import type { AiProvider } from "../provider";
import type { AiAskInput, AiProviderInfo, AiReply } from "../types";
import { AiNotImplementedError } from "../errors";

/**
 * Konfigurasi yang KELAK dibutuhkan integrasi OpenAI sungguhan. Disiapkan
 * sekarang (walau belum dipakai `ask()`) supaya bentuk pemanggilan
 * `new OpenAiProvider({ apiKey, model })` sudah stabil sejak awal — nanti
 * saat integrasi sungguhan dikerjakan, pemanggil di `container.ts` tidak
 * perlu berubah, cukup isi `ask()` di file ini.
 */
export interface OpenAiProviderConfig {
  apiKey?: string;
  model?: string;
  baseUrl?: string;
}

/**
 * Mode Online — PLACEHOLDER. Belum tersambung ke OpenAI atau API LLM
 * mana pun ("Belum perlu menghubungkan ke OpenAI" — lihat instruksi
 * tugas ini). Class ini SUDAH mengimplementasikan `AiProvider` secara
 * penuh, supaya:
 *
 * 1. `AiService`/`container.ts` bisa langsung mendaftarkan mode
 *    `"online"` hari ini (mis. untuk menyiapkan toggle mode di UI nanti)
 *    tanpa menunggu integrasi API selesai.
 * 2. Saat integrasi sungguhan dikerjakan, PERUBAHAN CUKUP DI FILE INI:
 *    - `isAvailable()` diisi jadi mengecek `config.apiKey` ada & (opsional)
 *      `navigator.onLine`.
 *    - `ask()` diisi jadi memanggil OpenAI API (chat completion) dengan
 *      `input.history` sebagai context, lalu memetakan hasilnya ke
 *      bentuk `AiReply` yang SAMA seperti yang dikembalikan
 *      `OfflineAiProvider` — `AiService`, halaman chat, dan seluruh
 *      pemanggil lain tidak perlu tahu maupun berubah sama sekali.
 */
export class OpenAiProvider implements AiProvider {
  readonly info: AiProviderInfo = {
    id: "openai",
    mode: "online",
    label: "OpenAI (belum tersambung)",
  };

  constructor(private readonly config: OpenAiProviderConfig = {}) {}

  /**
   * Selalu `false` untuk saat ini — belum ada koneksi apa pun ke provider
   * online mana pun. `AiService.ask()` akan melempar
   * `AiProviderUnavailableError` sebelum sempat memanggil `ask()` di
   * bawah, jadi pemanggil dapat pesan yang jelas alih-alih error jaringan
   * yang membingungkan.
   */
  async isAvailable(): Promise<boolean> {
    return false;
  }

  /**
   * Belum diimplementasikan — sengaja melempar `AiNotImplementedError`
   * eksplisit (bukan pesan generik) bila suatu saat dipanggil langsung
   * tanpa lewat `isAvailable()`.
   */
  async ask(_input: AiAskInput): Promise<AiReply> {
    void this.config; // dipakai nanti saat integrasi sungguhan dikerjakan.
    throw new AiNotImplementedError(
      "Mode Online belum tersambung ke provider AI mana pun. Gunakan Mode Offline untuk saat ini."
    );
  }
}
