# Panduan Menulis Konten

Folder ini adalah satu-satunya sumber materi aplikasi (doa, dzikir,
afirmasi, artikel). Semua dibaca lewat Content Engine di
`src/services/content/` — cukup tambah file `.md` baru di sub-folder yang
sesuai, tidak perlu menyentuh kode.

Setiap file wajib punya frontmatter YAML (di antara `---`) diikuti body
Markdown bebas.

## `doa/*.md`

```yaml
---
title: "Judul doa"
excerpt: "Ringkasan singkat (opsional, auto dari body jika kosong)"
category: "anak-laki-laki"      # slug bebas, dipakai untuk filter
tags: ["doa", "..."]
arabicText: "..."
latinText: "..."
translationId: "Terjemahan Indonesia"
dalil: "QS. ... / HR. ..."        # opsional
context: ["Dibaca saat ...", "..."]
publishedAt: "2026-07-10"
coverEmoji: "🤲"
featured: false                    # opsional, default false
---
```

## `dzikir/*.md`

Sama seperti `doa/*.md`, ditambah `repeatCount` (angka, opsional — jumlah
anjuran pengulangan, mis. 33).

## `afirmasi/*.md`

```yaml
---
title: "Judul singkat"
excerpt: "Opsional — default memakai isi `text`"
category: "identitas-diri"
tags: ["afirmasi", "..."]
text: "Kalimat afirmasi lengkap yang ditampilkan sebagai konten utama."
publishedAt: "2026-07-15"
coverEmoji: "🌷"
featured: false
---
```

## `artikel/*.md`

```yaml
---
title: "Judul artikel"
excerpt: "Ringkasan untuk kartu daftar"
category: "kehamilan"            # lihat src/config/library.ts
tags: ["..."]
author: "Nama Penulis"
publishedAt: "2026-07-28"
coverEmoji: "🌱"
featured: false
---
```

Body Markdown di bawah frontmatter adalah isi artikel lengkap.

## Aturan umum

- Nama file (tanpa `.md`) menjadi `slug` — gunakan huruf kecil dan tanda
  hubung, mis. `doa-anak-laki-laki-jadi-pemimpin.md`.
- `category` bersifat bebas per jenis konten (bukan enum tertutup di
  engine) — tapi sebaiknya konsisten per domain agar filter kategori di UI
  rapi.
- `featured: true` menandai konten untuk ditonjolkan di section
  "Pilihan"; boleh ditandai di beberapa file sekaligus.
- Field tanggal (`publishedAt`) pakai format `YYYY-MM-DD`.
