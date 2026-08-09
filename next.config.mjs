import fs from "fs";
import path from "path";
import crypto from "crypto";
import withPWAInit from "next-pwa";

/**
 * ---------------------------------------------------------------------------
 * Precache manifest tambahan untuk halaman ber-render statis (App Router)
 * ---------------------------------------------------------------------------
 * `next-pwa`/workbox otomatis meng-precache seluruh aset build (JS, CSS,
 * font hasil `next/font`) lewat webpack asset manifest — itu terjadi tanpa
 * konfigurasi tambahan. Yang TIDAK ikut ter-precache otomatis adalah
 * dokumen HTML/RSC per rute (mis. `/library/gizi-seimbang-ibu-hamil`),
 * karena itu bukan aset webpack bertanda tangan hash, melainkan output
 * render Next di `.next/server`.
 *
 * Supaya seluruh materi Perpustakaan bisa dibaca offline SEJAK kunjungan
 * pertama (bukan baru ter-cache setelah user membuka satu per satu),
 * kita daftarkan setiap rute statis (Beranda, daftar Perpustakaan, tiap
 * artikel, dst.) ke `additionalManifestEntries` di bawah. Service worker
 * akan mem-fetch & menyimpan semuanya saat event `install` — asal build
 * ini pernah dibuka online sekali, sisanya otomatis tersedia offline.
 *
 * `revision` dihitung dari hash isi file Markdown supaya cache otomatis
 * dianggap "berubah" (dan di-refetch) tiap kali konten artikel diedit.
 */
function getLibraryPrecacheEntries() {
  const contentDir = path.join(process.cwd(), "content", "library");
  const staticRoutes = ["/", "/library", "/offline", "/splash", "/welcome", "/onboarding", "/sobat-bunda"];

  const staticEntries = staticRoutes.map((url) => ({
    url,
    // Rute non-artikel jarang berubah bentuk; revision statis cukup dan
    // dibarui manual (ubah string ini) kalau shell halaman berubah besar.
    revision: "shell-v1",
  }));

  const articleEntries = fs.existsSync(contentDir)
    ? fs
        .readdirSync(contentDir)
        .filter((name) => name.endsWith(".md"))
        .map((filename) => {
          const slug = filename.replace(/\.md$/, "");
          const raw = fs.readFileSync(path.join(contentDir, filename), "utf8");
          const revision = crypto.createHash("md5").update(raw).digest("hex").slice(0, 10);
          return { url: `/library/${slug}`, revision };
        })
    : [];

  // `search-data.json` (dihasilkan `scripts/generate-search-data.mjs` lewat
  // npm script `predev`/`prebuild`, lihat file itu) berisi seluruh Markdown
  // yang sudah diratakan jadi plain text untuk Search Engine lokal
  // (`src/lib/db/services/search/`). Ia HARUS ikut di-precache di sini,
  // sama seperti halaman artikel di atas — kalau tidak, pencarian baru bisa
  // membangun index setelah pengguna sempat online sekali secara kebetulan
  // membuka file ini, bukan terjamin sejak instalasi PWA pertama.
  const searchDataPath = path.join(process.cwd(), "public", "search-data.json");
  const searchDataEntry = fs.existsSync(searchDataPath)
    ? [
        {
          url: "/search-data.json",
          revision: JSON.parse(fs.readFileSync(searchDataPath, "utf8")).version,
        },
      ]
    : [];

  // `daily-journey-pool.json` (dihasilkan `scripts/generate-daily-journey-pool.mjs`
  // lewat npm script `predev`/`prebuild`) berisi id + metadata ringan
  // seluruh doa/dzikir/afirmasi/artikel yang dipakai Daily Journey Engine
  // (`src/services/daily-journey/`) untuk memilih materi harian. Sama
  // seperti `search-data.json`, ini HARUS ikut di-precache supaya materi
  // hari pertama tetap bisa ditentukan walau pengguna offline sejak
  // instalasi PWA pertama.
  const dailyJourneyPoolPath = path.join(process.cwd(), "public", "daily-journey-pool.json");
  const dailyJourneyPoolEntry = fs.existsSync(dailyJourneyPoolPath)
    ? [
        {
          url: "/daily-journey-pool.json",
          revision: JSON.parse(fs.readFileSync(dailyJourneyPoolPath, "utf8")).version,
        },
      ]
    : [];

  return [...staticEntries, ...articleEntries, ...searchDataEntry, ...dailyJourneyPoolEntry];
}

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  // Registrasi SW dilakukan manual lewat <ServiceWorkerRegister /> (lihat
  // src/components/pwa/service-worker-register.tsx) supaya kita bisa
  // menampilkan UI "ada versi baru, muat ulang" — bukan didaftarkan diam-
  // diam oleh next-pwa.
  register: false,
  // Sengaja `false`: worker baru menunggu (`waiting`) sampai pengguna
  // menyetujui lewat tombol "Muat ulang" di <ServiceWorkerRegister />
  // (yang mengirim pesan `{ type: "SKIP_WAITING" }` ke worker yang
  // menunggu) — bukan langsung ambil alih di tengah sesi Bunda menulis
  // jurnal atau membaca artikel.
  skipWaiting: false,
  // Halaman App Router yang dinavigasi lewat <Link> (client-side, tanpa
  // full page load) tetap perlu ikut ter-cache — bukan cuma saat hard
  // navigation. Opsi ini bikin next-pwa ikut menyadap fetch RSC payload
  // dari navigasi client-side.
  cacheOnFrontEndNav: true,
  reloadOnOnline: true,
  additionalManifestEntries: getLibraryPrecacheEntries(),
  // File manifest internal Next yang kadang gagal di-fetch saat install
  // (menyebabkan seluruh precache batal) — aman untuk dikecualikan karena
  // tidak dibutuhkan di runtime browser.
  buildExcludes: [
    /middleware-manifest\.json$/,
    /app-build-manifest\.json$/,
    /_middleware\.js$/,
    /dynamic-css-manifest\.json$/,
  ],
  // Offline fallback: dipakai tiap kali sebuah dokumen (halaman) diminta
  // tapi tidak ada di cache DAN network gagal (mis. artikel yang belum
  // pernah dibuka, dibuka pertama kali saat offline).
  fallbacks: {
    document: "/offline",
  },
  // -------------------------------------------------------------------
  // Strategi cache berlapis (sesuai roadmap Phase 1 item C):
  //   1. App shell (JS/CSS/font)      -> CacheFirst   (immutable, hashed)
  //   2. Gambar & ikon                -> CacheFirst   (jarang berubah)
  //   3. Konten (halaman Perpustakaan)-> StaleWhileRevalidate
  //   4. Sisanya (navigasi lain)      -> NetworkFirst + fallback /offline
  //   (Data personal seperti Favorit/Jurnal/Progress disimpan langsung di
  //    IndexedDB — lihat src/lib/db — dan selalu bisa diakses tanpa internet)
  // -------------------------------------------------------------------
  runtimeCaching: [
    // 1. Font (self-hosted oleh next/font di /_next/static/media, plus
    //    jaga-jaga untuk font eksternal .woff/.woff2 lain).
    {
      urlPattern: ({ request, url }) =>
        request.destination === "font" || /\.(woff2?|eot|ttf|otf)$/i.test(url.pathname),
      handler: "CacheFirst",
      options: {
        cacheName: "font-cache",
        expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 },
        cacheableResponse: { statuses: [0, 200] },
      },
    },

    // 1b. Aset statis Next (JS/CSS hasil build) — lapisan cadangan di
    //     belakang precache (precache = sumber utama, ini jaring pengaman
    //     kalau satu entri precache terlewat/di-evict browser).
    {
      urlPattern: /\/_next\/static\/.*/i,
      handler: "CacheFirst",
      options: {
        cacheName: "static-resources",
        expiration: { maxEntries: 150, maxAgeSeconds: 60 * 60 * 24 * 30 },
        cacheableResponse: { statuses: [0, 200] },
      },
    },

    // 2. Semua aset gambar: ikon lokal, gambar publik, dan endpoint
    //    optimizer Next (`/_next/image`).
    {
      urlPattern: ({ request, url }) =>
        request.destination === "image" ||
        url.pathname.startsWith("/_next/image") ||
        /\.(png|jpe?g|gif|webp|avif|svg|ico)$/i.test(url.pathname),
      handler: "CacheFirst",
      options: {
        cacheName: "image-cache",
        expiration: { maxEntries: 120, maxAgeSeconds: 60 * 60 * 24 * 30 },
        cacheableResponse: { statuses: [0, 200] },
      },
    },

    // 3. Halaman Perpustakaan (daftar & detail artikel = konten Markdown
    //    yang sudah dirender jadi HTML/RSC). StaleWhileRevalidate: kalau
    //    ada di cache, tampil instan sambil diam-diam disegarkan di latar
    //    belakang bila online — dan tetap terbaca penuh saat offline.
    {
      urlPattern: ({ url, sameOrigin }) => sameOrigin && url.pathname.startsWith("/library"),
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "library-pages-cache",
        expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 14 },
        cacheableResponse: { statuses: [0, 200] },
      },
    },

    // 4. Sisa halaman/navigasi lain (Beranda, Sobat Bunda, Doa, Tirakat,
    //    Favorit, onboarding, dst). NetworkFirst supaya konten terbaru
    //    diprioritaskan saat online, tapi tetap bisa dibuka dari cache
    //    ketika offline; kalau belum pernah dibuka sama sekali -> jatuh ke
    //    `/offline` lewat opsi `fallbacks.document` di atas.
    {
      urlPattern: ({ request, sameOrigin }) => sameOrigin && request.mode === "navigate",
      handler: "NetworkFirst",
      options: {
        cacheName: "pages-cache",
        networkTimeoutSeconds: 6,
        expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 7 },
        cacheableResponse: { statuses: [0, 200] },
      },
    },
  ],
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

export default withPWA(nextConfig);
