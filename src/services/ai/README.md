# AI Engine (`@/services/ai`)

Fondasi arsitektur untuk fitur AI (dipakai halaman "AI Sobat Bunda")
supaya menambah/mengganti provider AI di kemudian hari — termasuk
menyambungkan OpenAI sungguhan — tidak perlu mengubah kode pemanggil
(halaman chat, hook, dsb) sama sekali. Modul ini **belum tersambung ke
internet**; `Mode Online` sengaja masih placeholder.

## Ide inti: Dependency Injection lewat satu interface

```
                     ┌───────────────────────┐
   pemanggil  ──────▶│       AiService        │  (satu-satunya yang dipanggil UI)
 (chat page,          │  - getMode/setMode      │
  hook, dsb)          │  - registerProvider     │
                     │  - ask(input)           │
                     └───────────┬─────────────┘
                                 │ hanya kenal interface
                                 ▼
                     ┌───────────────────────┐
                     │      AiProvider        │  ◀── KONTRAK (provider.ts)
                     │  - info                │
                     │  - isAvailable()        │
                     │  - ask(input)           │
                     └───────────┬─────────────┘
                     diimplementasikan oleh:
              ┌──────────────────┴───────────────────┐
              ▼                                        ▼
   ┌─────────────────────┐                  ┌─────────────────────┐
   │  OfflineAiProvider    │                  │   OpenAiProvider      │
   │  (offline/)            │                  │   (online/, placeholder)│
   │  - search markdown      │                  │  - BELUM tersambung    │
   │    lewat ContentSearchPort│                │  - isAvailable() -> false│
   └──────────┬──────────────┘                  └─────────────────────┘
              │ hanya kenal interface
              ▼
   ┌─────────────────────┐
   │  ContentSearchPort    │  ◀── KONTRAK KEDUA (ports/content-search.port.ts)
   └──────────┬──────────────┘
              │ diimplementasikan oleh
              ▼
   ┌─────────────────────────────┐
   │  createLocalSearchAdapter()   │  (adapters/) — SATU-SATUNYA file yang
   │  membungkus `searchService`     │  mengimpor `@/lib/db`
   │  (@/lib/db, IndexedDB, index    │
   │  dibangun dari file Markdown)   │
   └─────────────────────────────┘
```

`container.ts` adalah **composition root**: satu-satunya tempat kelas
konkret (`OfflineAiProvider`, `OpenAiProvider`, `createLocalSearchAdapter`)
benar-benar dibuat dan dirakit jadi satu `AiService`. Semua file lain,
termasuk `AiService` sendiri, hanya bicara lewat interface
(`AiProvider`, `ContentSearchPort`) — tidak pernah `import` implementasi
konkret satu sama lain secara langsung.

Ada **dua lapis DI**, bukan cuma satu:

1. `AiService` didekati lewat interface `AiProvider` — supaya mengganti
   "otak" (offline vs OpenAI vs provider lain) tidak menyentuh pemanggil.
2. `OfflineAiProvider` sendiri didekati lewat interface
   `ContentSearchPort` — supaya sumber pencarian materinya (saat ini:
   Search Engine lokal berbasis IndexedDB) juga bisa diganti tanpa
   mengubah logika Mode Offline.

## Struktur folder

```
src/services/ai/
├── types.ts                     Tipe data bersama (AiMessage, AiReply, AiSource, dst.)
├── provider.ts                  Interface AiProvider — kontrak utama (DI seam #1)
├── errors.ts                    Error khusus (AiProviderUnavailableError, dst.)
├── ai-service.ts                Class AiService — facade yang dipanggil pemanggil
├── container.ts                 Composition root — merakit provider jadi AiService
├── index.ts                     Titik impor tunggal (`@/services/ai`)
├── ports/
│   └── content-search.port.ts   Interface ContentSearchPort — kontrak kedua (DI seam #2)
├── adapters/
│   └── local-search.adapter.ts  Implementasi ContentSearchPort via `@/lib/db` searchService
├── offline/
│   ├── offline-ai-provider.ts   Mode Offline: AiProvider berbasis pencarian Markdown lokal
│   └── reply-templates.ts       Penyusun teks jawaban (pure, terpisah dari logika pencarian)
└── online/
    └── openai-provider.ts       Mode Online: AiProvider placeholder, belum tersambung
```

## Mode Offline

`OfflineAiProvider` (`offline/offline-ai-provider.ts`) menjawab pertanyaan
TANPA sekali pun menyentuh network:

1. Menerima `question` lewat `ask({ question })`.
2. Mencari lewat `ContentSearchPort` yang di-inject — implementasi
   sungguhan (`createLocalSearchAdapter`) membungkus Search Engine lokal
   yang sudah ada di proyek ini (`@/lib/db` — `searchService`), yang
   index-nya dibangun dari file Markdown di `/content` (lewat
   `public/search-data.json`) dan disimpan di IndexedDB.
3. Mencari tiga kategori sekaligus: **doa** (`searchDoa`), **artikel**
   (`searchArtikel`), dan **afirmasi** (`searchAfirmasi`).
4. Hasilnya disusun jadi teks jawaban (`reply-templates.ts`) + daftar
   `sources` (materi yang dipakai, untuk nanti ditautkan ke halaman
   detailnya di UI).

`isAvailable()` pada mode ini memeriksa apakah index Search Engine sudah
siap (`ContentSearchPort.isReady()`) — bukan konektivitas internet, karena
mode ini memang tidak butuh internet sama sekali.

## Mode Online

`OpenAiProvider` (`online/openai-provider.ts`) adalah **placeholder**:
sudah mengimplementasikan `AiProvider` secara penuh (supaya bisa langsung
didaftarkan & dipakai menyiapkan toggle mode di UI sekarang), tapi:

- `isAvailable()` selalu mengembalikan `false`.
- `ask()` melempar `AiNotImplementedError`.

Saat integrasi OpenAI (atau provider LLM lain) sungguhan dikerjakan,
**perubahan cukup di file ini** — isi `isAvailable()` (cek API key/koneksi)
dan `ask()` (panggil API, petakan hasil ke bentuk `AiReply` yang sama
seperti `OfflineAiProvider`). `AiService`, `container.ts` bagian offline,
dan pemanggil di UI tidak perlu diubah sama sekali.

## Cara pakai

```ts
import { createDefaultAiService } from "@/services/ai";

const ai = createDefaultAiService(); // mode awal: "offline"

const reply = await ai.ask({ question: "Doa apa yang baik dibaca saat anak sakit?" });
// reply.content   -> teks jawaban
// reply.sources    -> AiSource[] (doa/artikel/afirmasi yang dipakai)
// reply.providerId -> "offline-search"
// reply.mode       -> "offline"

ai.getMode();          // "offline"
await ai.isReady();     // true bila index Search Engine sudah terbangun

// Nanti, setelah integrasi API terpasang di `openai-provider.ts`:
ai.setMode("online");
await ai.ask({ question: "..." }); // otomatis lewat OpenAiProvider
```

## Cara menambah provider baru (mis. Claude, Gemini, model lokal)

1. Buat class baru di `src/services/ai/<nama-provider>/` yang
   mengimplementasikan `AiProvider` (lihat `provider.ts`).
2. Daftarkan di `container.ts` — tambah field baru di registry, atau
   ganti salah satu mode yang sudah ada.
3. Selesai. `AiService`, halaman chat, dan seluruh pemanggil lain TIDAK
   perlu diubah — mereka hanya pernah bicara lewat interface `AiProvider`.

## Kenapa bukan langsung dipakai di halaman "AI Sobat Bunda"?

Tugas ini fokus menyiapkan **arsitektur & fondasi** (interface, DI,
implementasi Mode Offline yang bekerja tanpa internet) — belum
menyambungkan ke halaman chat yang saat ini masih memakai balasan contoh
di `@/config/sobat-bunda.ts` (`getDummyReply`). Menyambungkannya tinggal
soal mengganti `getDummyReply(text)` dengan
`(await createDefaultAiService().ask({ question: text })).content` di
`src/app/(app)/sobat-bunda/page.tsx` — tidak butuh perubahan apa pun di
modul ini.
