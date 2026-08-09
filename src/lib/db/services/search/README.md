# Search Engine Lokal — Strategi Indexing

Search Engine ini bekerja 100% di client, tanpa API/network saat runtime,
dan menyimpan seluruh datanya di IndexedDB. Dokumen ini menjelaskan
**kenapa** strukturnya begini, bukan cuma **apa**-nya (untuk itu baca
langsung kode + komentar JSDoc di tiap file).

## 1. Alur data: dari Markdown ke index yang bisa di-query

```
content/**/*.md                         (sumber kebenaran, ditulis manusia)
        │  scripts/generate-search-data.mjs   (BUILD TIME, Node — bukan browser)
        ▼
public/search-data.json                 (aset statis: {version, documents[]})
        │  di-precache next-pwa (lihat next.config.mjs)
        ▼  ─── browser, saat app dibuka, lihat SearchIndexInitializer ───
search-index.service.ts  → tokenize seluruh dokumen → inverted index
        │  disimpan (bukan dibangun ulang tiap kali)
        ▼
IndexedDB: searchDocuments + searchTerms
        │  di-query oleh search-query.service.ts
        ▼
Hasil pencarian (SearchResultItem[])
```

Kenapa Markdown diubah jadi JSON statis di build time, bukan dibaca
langsung `fs` di client? Karena `fs` tidak ada di browser sama sekali, dan
requirement-nya adalah **offline dari awal** — bukan "offline setelah
online sekali secara kebetulan". Dengan menjadikannya aset statis yang
didaftarkan di `additionalManifestEntries` (`next.config.mjs`), service
worker menjamin file ini sudah ter-cache sejak PWA pertama kali di-install.

## 2. Struktur index: inverted index, bukan scan linear

Ada dua pendekatan umum untuk "cari dokumen yang mengandung kata X":

- **Forward index / linear scan**: untuk tiap pencarian, buka semua
  dokumen, cek satu-satu apakah mengandung kata X. Biaya per pencarian
  = O(jumlah dokumen × panjang tiap dokumen). Ini yang dipakai
  `src/utils/content/search.ts` (Content Engine server-side) — cukup untuk
  puluhan dokumen yang di-scan di server tiap request, tapi TIDAK cocok
  dipakai berulang-ulang di client tiap ketikan, apalagi kalau jumlah
  artikel terus bertambah.
- **Inverted index** (dipakai di sini): dibalik — untuk tiap KATA unik,
  simpan daftar dokumen yang mengandung kata itu ("posting list"). Biaya
  per pencarian = O(jumlah token di query × ukuran posting list yang
  relevan), **tidak bergantung pada total jumlah dokumen**. Inilah kenapa
  soal "cepat walau artikel bertambah banyak" bisa terpenuhi: menambah 1000
  artikel baru menambah ukuran index (linear), tapi TIDAK memperlambat
  query terhadap kata-kata yang sudah ada — kecuali kata itu sendiri makin
  umum (di-redam otomatis lewat idf, lihat §4).

Diimplementasikan sebagai object store `searchTerms` dengan `keyPath: "term"`
— satu record per token unik, isinya posting list (`{id, field, tf}[]`)
plus `df` (document frequency, jumlah dokumen unik yang mengandung token
itu, dipakai untuk skor idf).

## 3. Kenapa prefix search "gratis" tanpa index tambahan

IndexedDB selalu menyimpan **primary key string secara terurut leksikal**
(urutan UTF-16 code unit — sama seperti urutan kamus). Karena `searchTerms`
memakai token itu sendiri sebagai `keyPath`, kita bisa query rentang:

```ts
IDBKeyRange.bound(prefix, prefix + "\uffff")
```

dan IndexedDB akan mengembalikan **persis** seluruh token yang diawali
`prefix` — tanpa perlu index sekunder, tanpa scan seluruh store. Ini dipakai
di `SearchTermsRepository.findByPrefix()` dan jadi dasar kenapa mengetik
"kesab" bisa langsung menemukan dokumen berisi kata "kesabaran".

## 4. Scoring: field weight + log-tf + idf

Query bisa cocok di banyak token, banyak field, banyak dokumen. Supaya
hasil paling relevan naik ke atas, tiap kecocokan diberi skor:

```
skor = (1 + log(tf)) × bobotField × faktorJenisMatch × idf
```

| Komponen | Alasan |
|---|---|
| `1 + log(tf)` | Kemunculan kata ke-10 dalam satu dokumen tidak seharusnya bernilai 10× kemunculan pertama — diminishing returns standar di information retrieval. |
| `bobotField` (title=5, tags=4, category=2, content=1) | Kecocokan di judul jauh lebih menunjukkan relevansi daripada kecocokan di tengah body artikel yang panjang. |
| `faktorJenisMatch` (1 untuk exact, 0.5 untuk prefix-only) | "kesabaran" (exact) harus mengalahkan "kesab" (baru sebagian) untuk query yang sama. |
| `idf = log((N+1)/(df+1)) + 1` | Kata yang muncul di hampir semua dokumen (mis. lolos filter stopword tapi tetap umum) otomatis kurang membedakan dibanding kata yang cuma ada di sedikit dokumen — pola tf-idf standar. |

Skor per dokumen = **jumlah** skor dari semua token query yang cocok di
dokumen itu (semantik "OR berbobot": dokumen yang cocok di lebih banyak
kata query otomatis naik peringkat karena skornya terakumulasi, tanpa
perlu logika AND/OR eksplisit terpisah).

## 5. Empat fitur pencarian (Judul / Isi / Kategori / Tag)

Bukan empat index terpisah — cukup SATU inverted index dengan field
ditandai per posting (`SearchPosting.field`). "Search Judul" dkk. tinggal
memfilter posting yang field-nya cocok SEBELUM diagregasi jadi skor:

```ts
searchService.searchByTitle("doa anak");     // fields: ["title"]
searchService.searchByContent("kesabaran");  // fields: ["content"]
searchService.searchByCategory("kehamilan"); // fields: ["category"]
searchService.searchByTag("mpasi");          // fields: ["tags"]
searchService.search("apa saja");            // semua field (default)
```

Ada tambahan `findByExactTag()` untuk kasus "tampilkan semua dokumen
bertag X persis" (browse by tag, exact match lewat index `multiEntry` di
`searchDocuments`) — beda dari `searchByTag` yang mencari TOKEN bebas di
dalam teks tag (mis. token parsial/typo-tolerant lewat prefix match).

## 6. Kenapa index tidak dibangun ulang tiap kali app dibuka

`search-data.json` menyertakan `version` = hash MD5 dari seluruh isi
konten (dihitung sekali di build time). `ensureIndexReady()` membandingkan
`version` ini dengan yang tersimpan di store `settings` (dipakai ulang
sebagai "index metadata", bukan store baru — store ini sudah ada untuk
preferensi aplikasi lain). Sama → index dianggap masih valid, TIDAK ada
fetch ulang/tokenize ulang. Beda (konten berubah sejak build terakhir) →
index dibangun ulang sekali, lalu `version` baru disimpan.

Efeknya: biaya tokenizing (yang sebanding dengan **total kata di seluruh
konten**, potensial jadi besar seiring artikel bertambah) hanya terjadi
**sekali per perubahan konten**, bukan setiap kali pengguna membuka app —
apalagi setiap kali mengetik satu huruf pencarian.

## 7. Recent Search, Search History, Popular Search

Tiga store terpisah untuk tiga akses pattern berbeda:

- **`searchHistory`** (log mentah, satu record per pencarian) → sumber
  "Recent Search", dibaca lewat cursor mundur di index `createdAt`
  (`findRecent`) dan dideduplikasi di `search-history.service.ts` supaya
  query yang sama berulang tidak memenuhi daftar.
- **`searchStats`** (satu record per query UNIK, dengan counter `count`)
  → sumber "Popular Search". Dipisah dari `searchHistory` supaya
  menghitung "query mana yang paling sering dicari" tidak perlu
  scan+reduce seluruh riwayat (yang terus bertambah) — cukup baca store
  ini yang ukurannya sebanding jumlah query UNIK (jauh lebih kecil &
  stabil), lalu urutkan berdasarkan index `count` (cursor mundur, berhenti
  begitu `limit` terpenuhi).

Kedua store ditulis bersamaan setiap ada pencarian baru
(`searchHistoryService.record()`), dipanggil otomatis oleh `search()`
kecuali dipanggil dengan `{ recordHistory: false }`.

## 8. Ringkasan alasan "tetap cepat walau artikel bertambah banyak"

1. Query cost sebanding dengan **jumlah token di query + ukuran posting
   list yang relevan**, bukan total dokumen (inverted index, §2).
2. Prefix search memakai native B-tree range query IndexedDB (§3), bukan
   filter di JS atas seluruh store.
3. Tokenizing/indexing yang mahal (sebanding total kata di korpus) hanya
   terjadi sekali per perubahan konten, bukan per query atau per buka app
   (§6, version-gated rebuild).
4. "Recent" & "Popular" dibaca lewat cursor yang berhenti begitu `limit`
   terpenuhi, dan `searchStats` (bukan `searchHistory` mentah) yang jadi
   sumber Popular — keduanya menjaga biaya baca tetap kecil & konstan,
   tidak ikut membesar seiring riwayat pemakaian bertambah (§7).
5. `SearchTermsRepository.replaceAll()` menulis inverted index dalam
   beberapa transaksi kecil (bukan satu transaksi raksasa) supaya event
   loop browser tidak diblokir lama saat index dibangun ulang untuk korpus
   yang sudah besar.
