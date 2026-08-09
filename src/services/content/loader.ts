import fs from "fs";
import path from "path";
import matter from "gray-matter";

/**
 * Lapisan paling bawah dari Content Engine: satu-satunya tempat yang
 * menyentuh `fs`. Semua fungsi di atasnya (normalize.ts, engine.ts) tidak
 * boleh mengakses filesystem langsung — supaya kalau suatu saat sumber
 * data pindah (mis. dari file lokal ke Supabase), cukup ganti file ini.
 *
 * Hanya boleh diimpor dari Server Component / server-side code (Next.js
 * App Router), karena `fs` tidak tersedia di browser.
 */

const CONTENT_ROOT = path.join(process.cwd(), "content");

export interface RawContentFile {
  /** Nama file tanpa ekstensi `.md`, dipakai sebagai slug. */
  slug: string;
  /** Frontmatter mentah, belum divalidasi/di-cast — lihat normalize.ts. */
  data: Record<string, unknown>;
  /** Body Markdown, frontmatter sudah dilepas dan di-trim. */
  body: string;
}

/**
 * Baca seluruh file `.md` di satu sub-folder `/content/{folder}`.
 * Mengembalikan array kosong (bukan error) jika folder belum ada, supaya
 * aplikasi tetap jalan meski satu kategori konten belum diisi.
 */
export function readContentFolder(folder: string): RawContentFile[] {
  const dir = path.join(CONTENT_ROOT, folder);

  if (!fs.existsSync(dir)) {
    return [];
  }

  const filenames = fs.readdirSync(dir).filter((name) => name.endsWith(".md"));

  return filenames.map((filename) => {
    const slug = filename.replace(/\.md$/, "");
    const filePath = path.join(dir, filename);
    const raw = fs.readFileSync(filePath, "utf8");
    const { data, content } = matter(raw);

    return { slug, data, body: content.trim() };
  });
}
