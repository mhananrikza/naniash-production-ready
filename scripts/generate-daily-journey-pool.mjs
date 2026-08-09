/**
 * Generator `public/daily-journey-pool.json` — manifest statis untuk
 * Daily Journey Engine (lihat `src/services/daily-journey/` untuk
 * algoritma pemilihan & `src/lib/db/services/daily-journey.service.ts`
 * untuk penyimpanan progres harian di IndexedDB).
 *
 * Dijalankan di build time (Node, bukan browser) lewat npm script
 * `predev`/`prebuild`, BUKAN saat runtime — sama persis alasannya dengan
 * `generate-search-data.mjs`:
 *
 * 1. Daily Journey Engine harus bisa memilih & menampilkan materi 100%
 *    offline di client. Pemilihan materi butuh tahu SELURUH pool id per
 *    jenis (doa/dzikir/afirmasi/artikel) — tapi `fs` tidak tersedia di
 *    browser, jadi seluruh id + metadata ringan (judul, kategori, emoji,
 *    ringkasan — BUKAN body Markdown penuh) diratakan jadi satu file JSON
 *    statis yang di-fetch sekali lalu di-precache service worker.
 * 2. `version` (hash isi seluruh item) dipakai sebagai `revision` entri
 *    precache di `next.config.mjs`, supaya cache otomatis di-refresh tiap
 *    kali materi Markdown berubah (ditambah/dihapus/di-edit).
 * 3. Item diurutkan stabil berdasarkan `id` (BUKAN `publishedAt`/urutan
 *    file di disk) — lihat `buildDailyJourneyPools` di
 *    `src/services/daily-journey/pool.ts` untuk alasannya: algoritma
 *    pemilihan bergantung pada urutan pool yang konsisten hari ke hari.
 *
 * Skrip ini sengaja mandiri (tidak import dari `src/`) supaya bisa
 * dijalankan langsung dengan `node` tanpa transpile TypeScript.
 */

import fs from "fs";
import path from "path";
import crypto from "crypto";
import matter from "gray-matter";

const CONTENT_ROOT = path.join(process.cwd(), "content");
const OUTPUT_PATH = path.join(process.cwd(), "public", "daily-journey-pool.json");

const FOLDER_BY_TYPE = {
  doa: "doa",
  dzikir: "dzikir",
  afirmasi: "afirmasi",
  artikel: "artikel",
};

const COVER_EMOJI_FALLBACK = {
  doa: "🤲",
  dzikir: "📿",
  afirmasi: "🌷",
  artikel: "📖",
};

function toStringField(value, fallback = "") {
  return typeof value === "string" && value.trim().length > 0 ? value : fallback;
}

/** Ringkasan singkat dari teks polos — dipakai bila frontmatter `excerpt` tidak diisi. */
function deriveExcerpt(text, max = 160) {
  const plain = text.replace(/\s+/g, " ").trim();
  if (plain.length <= max) return plain;
  return `${plain.slice(0, max).trimEnd()}…`;
}

function readFolder(type) {
  const dir = path.join(CONTENT_ROOT, FOLDER_BY_TYPE[type]);
  if (!fs.existsSync(dir)) return [];

  return fs
    .readdirSync(dir)
    .filter((name) => name.endsWith(".md"))
    .map((filename) => {
      const slug = filename.replace(/\.md$/, "");
      const raw = fs.readFileSync(path.join(dir, filename), "utf8");
      const { data, content } = matter(raw);

      const title = toStringField(data.title, slug);
      // Untuk afirmasi, kalimat afirmasinya sendiri (frontmatter `text`)
      // lebih representatif untuk excerpt dibanding body penjelasan —
      // konsisten dengan `normalizeAfirmasi` di Content Engine.
      const fallbackSource = type === "afirmasi" ? toStringField(data.text, title) : content.trim() || title;

      return {
        id: `${type}:${slug}`,
        slug,
        type,
        title,
        category: toStringField(data.category, type === "artikel" ? "parenting" : "umum"),
        coverEmoji: toStringField(data.coverEmoji, COVER_EMOJI_FALLBACK[type]),
        excerpt: toStringField(data.excerpt) || deriveExcerpt(fallbackSource),
      };
    });
}

function main() {
  const items = Object.keys(FOLDER_BY_TYPE)
    .flatMap((type) => readFolder(type))
    .sort((a, b) => a.id.localeCompare(b.id));

  const version = crypto.createHash("sha256").update(JSON.stringify(items)).digest("hex").slice(0, 16);

  const manifest = {
    version,
    generatedAt: new Date().toISOString(),
    items,
  };

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(manifest, null, 2));

  console.log(
    `[daily-journey-pool] ${items.length} item ditulis ke ${path.relative(process.cwd(), OUTPUT_PATH)}`
  );
}

main();
