# Icons

Aset final digenerate dari cover resmi **"Hadiah dari Langit"** (ilustrasi
ibu & 2 anak, sumber tunggal untuk seluruh ikon PWA — bukan aset Naniash
generik). Semua sudut transparan bawaan cover diisi warna resmi app
`#F5FBFF` (sama dengan `background_color` di `manifest.json`), tanpa
padding atau elemen desain tambahan:

- `icon-192.png` — 192×192, full-bleed, purpose: `any`
- `icon-512.png` — 512×512, full-bleed, purpose: `any`
- `maskable-icon-512.png` — 512×512, konten dipusatkan dalam safe zone
  (~58,4% dari kanvas, rasio sama dengan revisi sebelumnya) supaya tidak
  terpotong oleh mask Android (circle, squircle, rounded-square, dll.) —
  sudah diuji lolos simulasi mask lingkaran penuh.
- `apple-touch-icon.png` — 180×180, full-bleed, RGB tanpa alpha (syarat
  iOS — iOS tidak baca ikon maskable dari manifest dan menolak transparansi
  pada apple-touch-icon).

Untuk regenerasi ulang bila cover resmi berganti, lihat skrip di riwayat
perubahan Checkpoint 2 (flatten full-bleed untuk `icon-*`/apple, safe-zone
~58% terpusat untuk `maskable-icon-512`).
