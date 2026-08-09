/**
 * Generator `public/search-data.json` — sumber data untuk Search Engine
 * lokal (lihat `src/lib/db/services/search/`).
 *
 * Dijalankan di build time (Node, bukan browser) lewat npm script
 * `prebuild`/`predev`, BUKAN saat runtime. Alasannya:
 *
 * 1. Search Engine harus bekerja 100% offline di client — ia tidak boleh
 *    bergantung pada `fs`/API route saat pengguna membuka app tanpa
 *    internet. Jadi seluruh isi `/content/**\/*.md` diubah jadi satu file
 *    JSON statis yang di-fetch sekali oleh browser lalu di-precache oleh
 *    service worker (lihat `next.config.mjs`) — sama persis dengan pola
 *    precache artikel Perpustakaan yang sudah ada di file itu.
 * 2. Markdown asli (dengan sintaks `#`, `**`, dsb.) tidak ideal untuk
 *    di-tokenize apa adanya, jadi di sini juga di-strip jadi plain text.
 * 3. File JSON ini menyertakan `version` (hash isi seluruh konten) supaya
 *    `search-index.service.ts` di client tahu kapan index IndexedDB perlu
 *    dibangun ulang — bukan setiap kali app dibuka (lihat penjelasan
 *    strategi indexing di README sebelah service tsb).
 *
 * Skrip ini sengaja mandiri (tidak import dari `src/`) supaya bisa
 * dijalankan langsung dengan `node` tanpa transpile TypeScript.
 */

import fs from "fs";
import path from "path";
import crypto from "crypto";
import matter from "gray-matter";

const CONTENT_ROOT = path.join(process.cwd(), "content");
const OUTPUT_PATH = path.join(process.cwd(), "public", "search-data.json");

const FOLDER_BY_TYPE = {
  doa: "doa",
  dzikir: "dzikir",
  afirmasi: "afirmasi",
  artikel: "artikel",
};

function toStringField(value, fallback = "") {
  return typeof value === "string" && value.trim().length > 0 ? value : fallback;
}

function toStringArray(value) {
  if (!Array.isArray(value)) return [];
  return value.filter((item) => typeof item === "string");
}

/** Ubah body Markdown jadi plain text yang enak ditokenize (buang sintaks, bukan makna). */
function stripMarkdown(markdown) {
  return markdown
    .replace(/```[\s\S]*?```/g, " ") // blok kode
    .replace(/`([^`]+)`/g, "$1") // inline code
    .replace(/!\[[^\]]*]\([^)]*\)/g, " ") // gambar
    .replace(/\[([^\]]+)]\([^)]*\)/g, "$1") // link -> teks link saja
    .replace(/^#{1,6}\s+/gm, "") // heading marker
    .replace(/^>\s?/gm, "") // blockquote marker
    .replace(/^[-*+]\s+/gm, "") // bullet marker
    .replace(/^\d+\.\s+/gm, "") // numbered list marker
    .replace(/[*_~]{1,3}/g, "") // bold/italic/strikethrough
    .replace(/\s+/g, " ")
    .trim();
}

function readFolder(folder) {
  const dir = path.join(CONTENT_ROOT, folder);
  if (!fs.existsSync(dir)) return [];

  return fs
    .readdirSync(dir)
    .filter((name) => name.endsWith(".md"))
    .map((filename) => {
      const slug = filename.replace(/\.md$/, "");
      const raw = fs.readFileSync(path.join(dir, filename), "utf8");
      const { data, content } = matter(raw);
      return { slug, data, body: content.trim() };
    });
}

/** Field tambahan yang jadi bagian "isi" per jenis konten (di luar body Markdown umum). */
function extraTextByType(type, data) {
  switch (type) {
    case "doa":
    case "dzikir":
      return [
        toStringField(data.latinText),
        toStringField(data.translationId),
        toStringArray(data.context).join(" "),
        toStringField(data.dalil),
      ].join(" ");
    case "afirmasi":
      return toStringField(data.text);
    default:
      return "";
  }
}

function buildDocument(type, raw) {
  const { slug, data, body } = raw;
  const title = toStringField(data.title, slug);
  const category = toStringField(data.category, "umum");
  const tags = toStringArray(data.tags);
  const excerpt = toStringField(data.excerpt);
  const bodyText = stripMarkdown(body);
  const contentText = [extraTextByType(type, data), bodyText].filter(Boolean).join(" ").trim();

  return {
    id: `${type}:${slug}`,
    slug,
    type,
    title,
    category,
    tags,
    excerpt,
    // Field "isi" yang benar-benar ditokenize untuk Search Isi — gabungan
    // body Markdown (sudah di-strip) + field teks khas per jenis konten
    // (mis. terjemahan doa/dzikir, kalimat afirmasi) supaya "Search Isi"
    // tetap menemukan doa/dzikir walau body-nya pendek.
    contentText,
  };
}

function generate() {
  const documents = Object.entries(FOLDER_BY_TYPE).flatMap(([type, folder]) =>
    readFolder(folder).map((raw) => buildDocument(type, raw))
  );

  const payload = { documents };
  const version = crypto.createHash("md5").update(JSON.stringify(payload)).digest("hex").slice(0, 16);

  const output = {
    version,
    generatedAt: new Date().toISOString(),
    count: documents.length,
    documents,
  };

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output), "utf8");
  console.log(`[search-data] ${documents.length} dokumen ditulis ke ${path.relative(process.cwd(), OUTPUT_PATH)} (version ${version})`);
}

generate();
