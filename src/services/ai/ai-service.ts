import type { AiProvider } from "./provider";
import type { AiAskInput, AiProviderInfo, AiProviderMode, AiReply } from "./types";
import { AiProviderNotRegisteredError, AiProviderUnavailableError } from "./errors";

/** Satu provider terdaftar per mode. `Partial` — mode boleh belum punya provider terdaftar sama sekali (mis. sebelum `container.ts` mendaftarkan `OpenAiProvider`). */
export type AiProviderRegistry = Partial<Record<AiProviderMode, AiProvider>>;

/**
 * `AiService` — satu-satunya kelas yang dipanggil pemanggil (nanti:
 * halaman chat Sobat Bunda, hook, dsb.) untuk bicara dengan "AI".
 *
 * Ini pusat pola Dependency Injection modul ini: `AiService` HANYA
 * bergantung pada interface `AiProvider` (lewat `AiProviderRegistry`),
 * tidak pernah pada `OfflineAiProvider`/`OpenAiProvider` secara langsung.
 * Provider mana pun yang mengimplementasikan `AiProvider` bisa
 * di-inject di sini — lewat constructor saat aplikasi start (lihat
 * `container.ts`), atau di-swap saat runtime lewat `registerProvider()`.
 *
 * Konsekuensinya: menambah provider baru (Claude, Gemini, model lokal,
 * dst.) TIDAK PERNAH mengubah file ini — cukup buat class baru yang
 * mengimplementasikan `AiProvider`, lalu daftarkan di `container.ts`.
 */
export class AiService {
  private mode: AiProviderMode;

  constructor(
    private readonly registry: AiProviderRegistry,
    initialMode: AiProviderMode = "offline"
  ) {
    if (!registry[initialMode]) {
      throw new AiProviderNotRegisteredError(initialMode);
    }
    this.mode = initialMode;
  }

  /** Mode yang sedang aktif ("offline" | "online"). */
  getMode(): AiProviderMode {
    return this.mode;
  }

  /**
   * Pindah mode aktif. Ini yang nanti dipanggil toggle "Mode Online/
   * Offline" di UI — tidak perlu membuat `AiService` baru, cukup ganti
   * mode pada instance yang sama.
   */
  setMode(mode: AiProviderMode): void {
    if (!this.registry[mode]) {
      throw new AiProviderNotRegisteredError(mode);
    }
    this.mode = mode;
  }

  /**
   * Daftarkan/ganti provider untuk satu mode saat runtime — mis. saat
   * `OpenAiProvider` sungguhan (dengan API key & koneksi asli) sudah
   * siap dipasang menggantikan placeholder saat ini. `AiService` sendiri
   * tidak perlu tahu apa yang berubah di baliknya.
   */
  registerProvider(mode: AiProviderMode, provider: AiProvider): void {
    this.registry[mode] = provider;
  }

  /** Provider yang aktif saat ini (sesuai `getMode()`). */
  private getActiveProvider(): AiProvider {
    const provider = this.registry[this.mode];
    if (!provider) throw new AiProviderNotRegisteredError(this.mode);
    return provider;
  }

  /** Info provider yang aktif — untuk ditampilkan (mis. label "Mode Offline · Pencarian Offline"). */
  getProviderInfo(): AiProviderInfo {
    return this.getActiveProvider().info;
  }

  /** `true` bila provider yang aktif saat ini siap menjawab. */
  async isReady(): Promise<boolean> {
    return this.getActiveProvider().isAvailable();
  }

  /**
   * Titik masuk utama: jawab satu pertanyaan lewat provider yang sedang
   * aktif. Melempar `AiProviderUnavailableError` bila provider tsb belum
   * siap — pemanggil (UI) yang memutuskan cara menampilkannya (mis. jatuh
   * kembali ke Mode Offline, atau tampilkan pesan "belum tersambung").
   */
  async ask(input: AiAskInput): Promise<AiReply> {
    const question = input.question.trim();
    if (!question) {
      throw new Error("Pertanyaan tidak boleh kosong.");
    }

    const provider = this.getActiveProvider();
    const available = await provider.isAvailable();
    if (!available) {
      throw new AiProviderUnavailableError(provider.info);
    }

    return provider.ask({ ...input, question });
  }
}
