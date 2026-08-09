import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";

import { findContentBySlug, getAllContent } from "@/services/content";
import { ContentReader } from "@/components/content/content-reader";

interface ContentDetailPageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Rute reader universal untuk seluruh jenis materi Content Engine (doa,
 * dzikir, afirmasi, artikel) — lihat Prompt 22. Tombol "Baca Doa" di Home
 * (`DoaHariIniCard`) dan tautan konten lain semuanya menuju satu pola
 * `/content/[slug]` ini, sehingga tidak perlu rute terpisah per jenis
 * konten hanya untuk menampilkan detail.
 */
export function generateStaticParams() {
  return getAllContent().map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: ContentDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const item = findContentBySlug(slug);
  if (!item) return {};

  return {
    title: `${item.title} — Hadiah dari Langit`,
    description: item.excerpt,
  };
}

export default async function ContentDetailPage({ params }: ContentDetailPageProps) {
  const { slug } = await params;
  const item = findContentBySlug(slug);
  if (!item) notFound();

  // `ContentReader` membaca `useSearchParams()` (konteks `?from=daily-journey`
  // dari Prompt 23) — perlu Suspense boundary agar rute yang di-generate
  // statis (`generateStaticParams` di atas) tetap bisa di-build.
  return (
    <Suspense fallback={null}>
      <ContentReader item={item} />
    </Suspense>
  );
}
