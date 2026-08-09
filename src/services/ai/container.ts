import { AiService, type AiProviderRegistry } from "./ai-service";
import { OfflineAiProvider } from "./offline/offline-ai-provider";
import { GeminiProvider } from "./online/gemini-provider";
import { createLocalSearchAdapter } from "./adapters/local-search.adapter";

/**
 * Composition root AI Engine — SATU-SATUNYA tempat implementasi konkret
 * (`OfflineAiProvider`, `GeminiProvider`, `createLocalSearchAdapter`)
 * dirakit jadi satu `AiService`. Seluruh file lain di `@/services/ai`
 * (dan pemanggil di luar modul ini) tidak pernah membuat provider secara
 * langsung — mereka menerima `AiService` yang sudah jadi dari sini.
 *
 * Kenapa dipisah dari `ai-service.ts`? `AiService` adalah KONTRAK
 * (bagaimana pemanggil bicara dengan AI); `container.ts` adalah
 * KEPUTUSAN (implementasi konkret mana yang dipakai hari ini). Memisah
 * keduanya berarti mengganti keputusan itu — mis. suatu hari default-nya
 * berubah, atau ditambah provider ketiga — cukup mengubah file ini,
 * `AiService` tidak pernah perlu disentuh.
 */

/**
 * Bangun registry berisi kedua mode: `"offline"` (Search Engine lokal,
 * `offline/offline-ai-provider.ts`) & `"online"` (Gemini 3.1 Flash-Lite
 * lewat Netlify Function, `online/gemini-provider.ts`). Kedua provider
 * memakai `ContentSearchPort` yang sama (`createLocalSearchAdapter()`) —
 * satu index pencarian lokal dipakai kedua mode, tidak dibangun dua kali.
 */
export function createAiProviderRegistry(): AiProviderRegistry {
  const contentSearch = createLocalSearchAdapter();
  return {
    offline: new OfflineAiProvider(contentSearch),
    online: new GeminiProvider(contentSearch),
  };
}

/**
 * Buat `AiService` siap pakai dengan konfigurasi default aplikasi:
 * Mode Offline & Mode Online sama-sama terdaftar, dimulai di Mode
 * Offline (satu-satunya yang benar-benar berfungsi tanpa integrasi
 * lebih lanjut).
 *
 * Ini fungsi yang dipanggil pemanggil (nanti: halaman chat Sobat Bunda,
 * atau sebuah React Context/Provider) — bukan `new AiService(...)`
 * langsung, supaya cara merakit provider tetap terpusat di sini.
 *
 * ```ts
 * import { createDefaultAiService } from "@/services/ai";
 *
 * const ai = createDefaultAiService();
 * const reply = await ai.ask({ question: "Doa apa saat anak sakit?" });
 * ```
 */
export function createDefaultAiService(): AiService {
  return new AiService(createAiProviderRegistry(), "offline");
}
