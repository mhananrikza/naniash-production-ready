import type { AiProviderInfo } from "./types";

/** Error dasar — seluruh error di `@/services/ai` turunan dari ini, supaya pemanggil bisa `instanceof AiError` untuk penanganan generik. */
export class AiError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "AiError";
  }
}

/** Provider yang dipilih (`AiService.ask()`) sedang tidak siap — mis. index Search Engine offline belum terbangun, atau (nanti) API key online belum diisi/tidak ada koneksi internet. */
export class AiProviderUnavailableError extends AiError {
  constructor(public readonly providerInfo: AiProviderInfo) {
    super(`Provider AI "${providerInfo.label}" (mode ${providerInfo.mode}) sedang tidak tersedia.`);
    this.name = "AiProviderUnavailableError";
  }
}

/**
 * Provider mengimplementasikan `AiProvider` secara struktural tapi
 * fungsinya sungguhan BELUM dipasang — dipakai `OpenAiProvider` (lihat
 * `online/openai-provider.ts`) sebagai placeholder eksplisit, supaya
 * pemanggil yang mencoba mode online sebelum waktunya dapat pesan yang
 * jelas, bukan error jaringan yang membingungkan.
 */
export class AiNotImplementedError extends AiError {
  constructor(message = "Provider ini belum diimplementasikan — placeholder untuk integrasi mendatang.") {
    super(message);
    this.name = "AiNotImplementedError";
  }
}

/** Mode yang diminta (`AiService.setMode`) belum punya provider terdaftar di registry. */
export class AiProviderNotRegisteredError extends AiError {
  constructor(mode: string) {
    super(`Belum ada provider terdaftar untuk mode "${mode}".`);
    this.name = "AiProviderNotRegisteredError";
  }
}
