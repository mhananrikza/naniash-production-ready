# Hadiah dari Langit — Fondasi Frontend

Fondasi project Next.js 15 (App Router) untuk **Hadiah dari Langit**, sesuai
Phase 1 di roadmap. Fokus commit ini: struktur folder, konfigurasi, tema,
dan shell layout (Header, Sidebar, Bottom Navigation) yang responsif —
**belum** fitur (Doa, Tirakat, dst.), sesuai arahan.

## Stack

Next.js 15 · TypeScript · Tailwind CSS · shadcn/ui (pola manual) ·
Framer Motion · Supabase (`@supabase/ssr`) · next-pwa

## Menjalankan

```bash
npm install
cp .env.example .env.local   # isi NEXT_PUBLIC_SUPABASE_URL & ANON_KEY
npm run dev
```

> Project ini ditulis manual (bukan hasil `create-next-app`) di lingkungan
> tanpa akses jaringan, jadi `npm install` belum pernah dijalankan di sini.
> Versi dependency di `package.json` sudah dipilih supaya kompatibel satu
> sama lain (Next 15 + React 19) — jalankan `npm install` lalu
> `npm run type-check` sebagai langkah pertama untuk memastikan semua rapi
> di mesinmu.

## Struktur folder

```
content/
└── library/                  # sumber konten Perpustakaan — file Markdown + frontmatter
src/
├── app/
│   ├── (app)/            # Rute di dalam shell aplikasi (Header/Sidebar/BottomNav)
│   │   ├── layout.tsx
│   │   ├── page.tsx       # Home Dashboard
│   │   └── library/        # Perpustakaan — daftar (page.tsx) & detail ([slug]/page.tsx)
│   ├── (auth)/            # Rute di luar shell (login, onboarding) — belum diisi
│   ├── globals.css        # design tokens (light/dark)
│   ├── layout.tsx         # root layout: font, metadata, PWA meta
│   └── providers.tsx
├── components/
│   ├── layout/             # Header, Sidebar, BottomNav, AppShell, ThemeToggle
│   ├── library/             # Search, filter kategori, kartu artikel, reader Markdown
│   ├── providers/          # ThemeProvider (next-themes)
│   └── ui/                 # komponen dasar gaya shadcn (Button, Avatar, ...)
├── config/
│   ├── navigation.ts        # satu sumber item nav — dipakai Sidebar & BottomNav
│   ├── library.ts           # taksonomi kategori Perpustakaan (nama + ikon)
│   └── site.ts
├── hooks/
│   ├── use-local-storage.ts        # hook localStorage generik, hydration-safe
│   ├── use-library-favorites.ts    # favorit Perpustakaan (per-perangkat)
│   └── use-reading-progress.ts     # progres baca untuk "Lanjutkan Membaca"
├── lib/
│   ├── supabase/            # client.ts (browser), server.ts, middleware.ts
│   ├── library.ts            # loader Markdown Perpustakaan (fs + gray-matter)
│   └── utils.ts              # cn(), getGreeting()
├── middleware.ts             # refresh sesi Supabase per-request
└── types/                    # tipe domain (Doa, Tirakat, Profile, LibraryArticle, ...)
```

## Perpustakaan (Library)

Halaman `/library` menampilkan materi bacaan yang sumbernya adalah file
Markdown di `content/artikel/*.md` (frontmatter: `title`, `excerpt`,
`category`, `tags`, `author`, `publishedAt`, `coverEmoji`) — bukan dari
Supabase, beda dari domain lain di fondasi ini. Loader-nya sekarang lewat
Content Engine di `services/content/` (lihat bagian "Content Engine" di
bawah); `lib/library.ts` hanya shim kompatibilitas untuk halaman ini.

Fitur yang tersedia:

- **Search** — pencarian judul, ringkasan, dan tag secara real-time.
- **Filter kategori** — chip horizontal (`config/library.ts`), bisa
  dikombinasikan dengan filter favorit.
- **Favorit** — toggle hati di tiap kartu/detail, tersimpan di
  `localStorage` (`hooks/use-library-favorites.ts`).
- **Lanjutkan Membaca** — progres scroll di halaman detail dilacak dan
  disimpan di `localStorage` (`hooks/use-reading-progress.ts`), muncul di
  bagian atas daftar selama belum ada pencarian/filter aktif.
- **Artikel Terbaru** — enam artikel dengan `publishedAt` terbaru.

Menambah materi baru cukup dengan menambah satu file `.md` baru di
`content/artikel/` — tidak perlu menyentuh kode React sama sekali.

## Content Engine

Selain artikel, ada tiga jenis materi lain yang sumbernya juga file
Markdown lokal, dibaca lewat sistem yang sama: `content/doa/`,
`content/dzikir/`, dan `content/afirmasi/`. Semua diakses lewat satu API
di `services/content/` (lihat `services/content/index.ts`) — jangan impor
`services/content/engine.ts` atau `loader.ts` langsung.

```
content/
  doa/*.md          dzikir/*.md       afirmasi/*.md      artikel/*.md
src/
  types/content.ts            # ContentItem (union doa/dzikir/afirmasi/artikel)
  utils/content/               # reading-time, frontmatter, id, sort, search
  services/content/
    loader.ts                  # satu-satunya file yang menyentuh fs
    normalize.ts                # raw frontmatter -> ContentItem bertipe
    engine.ts                   # 7 fungsi publik (lihat di bawah)
    index.ts                    # titik impor: `@/services/content`
```

Fungsi yang tersedia (semua server-side, baca file lokal, tanpa API):

- `getAllContent(options?)` — semua konten (ringkas), bisa difilter `type`.
- `getContentBySlug(type, slug)` — satu konten lengkap termasuk body Markdown.
- `getContentByCategory(category, options?)` — filter kategori tematik.
- `searchContent(query, options?)` — pencarian berbobot field, tanpa
  dependency eksternal.
- `getLatestContent(options?)` — terurut `publishedAt` terbaru.
- `getFeaturedContent(options?)` — frontmatter `featured: true`, fallback
  ke terbaru bila belum ada yang ditandai.
- `getContinueReading(progressEntries, options?)` — mencocokkan data
  progres baca (dipasok pemanggil, mis. dari `localStorage`) dengan konten
  yang masih ada.

Menambah materi baru: tambah satu file `.md` di sub-folder yang sesuai,
tidak perlu mengubah kode.

Prinsip: setiap fitur baru menambah folder di `app/(app)/<fitur>/`,
memakai tipe dari `types/`, dan kalau perlu komponen baru → taruh di
`components/ui` (primitif) atau `components/<fitur>` (spesifik fitur),
bukan menumpuk semua di satu file.

## Tema & desain

Lihat [`DESIGN.md`](./DESIGN.md) untuk rasional palet, tipografi, dan
signature element. Dark mode via `next-themes`, di-toggle lewat
`ThemeToggle` di Header, default mengikuti preferensi sistem.

## Supabase

`lib/supabase/client.ts` untuk Client Components, `server.ts` untuk
Server Components/Actions, `middleware.ts` untuk refresh token — pola
resmi `@supabase/ssr`. Schema (`content_categories`, `doa`, `afirmasi`,
`tirakat_items`, `profiles`) belum dibuat di sini; ikuti urutan
pengerjaan Phase 1 langkah 2 di roadmap.

## Belum termasuk di fondasi ini (sengaja)

- Halaman fitur (Doa, Tirakat, Afirmasi, Favorit) — folder rute sudah
  "dijanjikan" lewat `config/navigation.ts`, tapi isinya menyusul.
- Aset ikon PWA final (lihat `public/icons/README.md`).
- Halaman auth/onboarding (lihat `src/app/(auth)/README.md`).
- `runtimeCaching` next-pwa (strategi cache per layer) — placeholder
  komentar sudah ada di `next.config.mjs`.
