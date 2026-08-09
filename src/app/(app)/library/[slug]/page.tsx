import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getAllArticleSlugs, getArticleBySlug } from "@/lib/library";
import { ArticleReader } from "@/components/library/article-reader";

interface LibraryArticlePageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getAllArticleSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: LibraryArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) return {};

  return {
    title: `${article.title} — Hadiah dari Langit`,
    description: article.excerpt,
  };
}

export default async function LibraryArticlePage({ params }: LibraryArticlePageProps) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) notFound();

  return <ArticleReader article={article} />;
}
