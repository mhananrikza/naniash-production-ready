# Design System — Hadiah dari Langit

Arah visual: **langit senja yang perlahan menuju malam** — sesuai nama
produk, "hadiah" digambarkan sebagai cahaya hangat yang turun dari langit
yang meredup. Ini dipilih supaya identitas terasa spesifik untuk konteks
spiritual & keibuan produk (doa harian untuk anak), bukan palet default
"cream + terracotta" yang umum dipakai di produk AI generik.

## Warna

| Token | Peran | Contoh hex |
|---|---|---|
| `langit-950` → `langit-50` | Dasar gelap→terang, dominan di dark mode | `#141230` → `#F1EFFB` |
| `cahaya-500` | Aksen utama ("hadiah"/cahaya yang turun) — primary | `#E7A94C` |
| `senja-400` | Aksen hangat & keibuan — secondary | `#D98A94` |
| `nur-500` | Aksen tegas untuk teks/emphasis, dari "cahaya" (Ar.) | `#4A3F7A` |

Light & dark mode dikontrol lewat CSS variables di `globals.css`
(`--background`, `--primary`, dst.), mengikuti konvensi shadcn/ui supaya
kompatibel dengan komponen yang di-generate lewat `components.json`.

## Tipografi

- **Display — Fraunces**: serif hangat dengan optical sizing, dipakai
  terbatas di judul (`font-display`). Memberi nuansa personal & tidak
  kaku, cocok untuk produk yang posisinya sebagai "sahabat", bukan alat
  utilitas semata.
- **Body/UI — Plus Jakarta Sans**: sans humanis, keterbacaan baik untuk
  teks panjang berbahasa Indonesia (termasuk transliterasi Arab-Latin).

## Layout

- Radius besar (`--radius: 1rem`) di kartu — meniru bentuk lentera/kartu
  doa, bukan garis tegas ala broadsheet.
- Bottom navigation berbentuk pill mengambang di mobile, digantikan
  sidebar penuh di ≥768px (`Sidebar` & `BottomNav` berbagi satu sumber
  data di `config/navigation.ts` agar tidak drift).

## Signature element

Strip gradien tipis (`bg-gradient-langit`, 4px) di paling atas Header,
merepresentasikan garis langit senja yang menaungi seluruh shell — hadir
konsisten di setiap halaman tanpa mendominasi. Ditemani titik kecil
"berkedip" (`animate-berkelip`, respects `prefers-reduced-motion`) di
sebelah wordmark sebagai jejak kehadiran Naniash sejak sebelum AI-nya
aktif di Phase 3.

## Kenapa bukan default AI generik

- Bukan cream (#F4F1EA) + terracotta (#D97757) — palet dasar bertumpu di
  gradasi indigo-ungu (`langit`), bukan clay/tanah.
  Bukan pula dark+neon atau broadsheet hairline-rules.
- Tidak memakai marker bernomor (01/02/03) di navigasi — item nav bukan
  sebuah urutan proses, jadi tidak diberi penomoran dekoratif.
