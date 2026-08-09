import { getAllArticles } from "@/lib/library";
import { Reveal } from "@/components/ui/reveal";
import { GreetingHeader } from "@/components/home/greeting-header";
import { HomeDashboardClient } from "@/components/home/home-dashboard-client";

/**
 * Home Dashboard — halaman pertama yang dilihat Bunda setelah login.
 * Server Component ini HANYA menyentuh `fs` lewat Content Engine
 * (`getAllArticles`, dipakai untuk "Lanjutkan Membaca") dan meneruskannya
 * sebagai props ke `HomeDashboardClient`. Semua sumber data lain (Daily
 * Journey Engine, Doa Hari Ini, Challenge, streak) dibaca langsung dari
 * IndexedDB di sisi client lewat hook masing-masing — tidak ada Supabase,
 * tidak ada data contoh untuk bagian yang sumber lokalnya sudah ada.
 */
export default function HomePage() {
  const articles = getAllArticles().map((article) => {
    const { slug, title, excerpt, category, tags, author, publishedAt, readingTimeMinutes, coverEmoji } =
      article;
    return { slug, title, excerpt, category, tags, author, publishedAt, readingTimeMinutes, coverEmoji };
  });

  return (
    <div className="space-y-6 pb-4">
      <Reveal index={0}>
        <GreetingHeader />
      </Reveal>

      <HomeDashboardClient articles={articles} />
    </div>
  );
}
