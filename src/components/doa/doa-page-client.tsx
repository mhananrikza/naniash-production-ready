"use client";

import * as React from "react";
import { HandHeart, SearchX } from "lucide-react";

import { Naniash } from "@/components/naniash/naniash";
import { Reveal } from "@/components/ui/reveal";
import { LibrarySearchBar } from "@/components/library/library-search-bar";
import { DoaCategoryFilter, ALL_DOA_CATEGORY_SLUG } from "@/components/doa/doa-category-filter";
import { DoaCard, type DoaContentMeta } from "@/components/doa/doa-card";
import { isIndexedDbSupported, favoritesService } from "@/lib/db";

export interface DoaPageClientProps {
  items: DoaContentMeta[];
}

/**
 * Client Component halaman `/doa`. Data doa datang dari Content Engine
 * lewat Server Component induk (`getAllContent({ type: "doa" })`) —
 * komponen ini sendiri tidak membaca `fs`, hanya mengelola state UI
 * (search, filter kategori, favorit). Pola identik `DzikirPageClient`
 * dan `AfirmasiPageClient`.
 *
 * Favorit disimpan lewat `favoritesService` (IndexedDB, tipe `"doa"`).
 */
export function DoaPageClient({ items }: DoaPageClientProps) {
  const [query, setQuery] = React.useState("");
  const [category, setCategory] = React.useState(ALL_DOA_CATEGORY_SLUG);
  const [favoritesOnly, setFavoritesOnly] = React.useState(false);
  const [favorites, setFavorites] = React.useState<string[]>([]);
  const [favoritesLoaded, setFavoritesLoaded] = React.useState(false);

  React.useEffect(() => {
    if (!isIndexedDbSupported()) return;
    let cancelled = false;

    favoritesService.list("doa").then((records) => {
      if (!cancelled) {
        setFavorites(records.map((record) => record.refId));
        setFavoritesLoaded(true);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleToggleFavorite(slug: string) {
    setFavorites((prev) => (prev.includes(slug) ? prev.filter((item) => item !== slug) : [...prev, slug]));
    try {
      await favoritesService.toggle("doa", slug);
    } catch {
      setFavorites((prev) => (prev.includes(slug) ? prev.filter((item) => item !== slug) : [...prev, slug]));
    }
  }

  const normalizedQuery = query.trim().toLowerCase();

  const filteredItems = React.useMemo(() => {
    return items.filter((doa) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        doa.title.toLowerCase().includes(normalizedQuery) ||
        doa.excerpt.toLowerCase().includes(normalizedQuery) ||
        doa.translationId.toLowerCase().includes(normalizedQuery) ||
        doa.tags.some((tag) => tag.toLowerCase().includes(normalizedQuery)) ||
        doa.context.some((situation) => situation.toLowerCase().includes(normalizedQuery));

      const matchesCategory = category === ALL_DOA_CATEGORY_SLUG || doa.category === category;
      const matchesFavorite = !favoritesOnly || favorites.includes(doa.slug);

      return matchesQuery && matchesCategory && matchesFavorite;
    });
  }, [items, normalizedQuery, category, favoritesOnly, favorites]);

  const isFiltering = normalizedQuery.length > 0 || category !== ALL_DOA_CATEGORY_SLUG || favoritesOnly;

  function handleResetFilters() {
    setQuery("");
    setCategory(ALL_DOA_CATEGORY_SLUG);
    setFavoritesOnly(false);
  }

  return (
    <div className="space-y-6 pb-4">
      <Reveal index={0}>
        <div className="relative flex items-center gap-4 overflow-hidden rounded-[1.75rem] bg-langit-50 px-5 py-5 sm:px-7 sm:py-6">
          <div
            className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-langit-100/70 blur-xl"
            aria-hidden
          />
          <Naniash pose="prayer" size={92} priority className="relative shrink-0" />
          <div className="relative space-y-1">
            <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-langit-700">
              <HandHeart className="h-3.5 w-3.5" aria-hidden />
              Doa
            </p>
            <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
              Doa untuk Perjalanan Bunda
            </h1>
            <p className="text-sm text-muted-foreground">
              Kumpulan doa harian untuk anak dan keluarga — cari berdasarkan situasi, atau jelajahi per
              kategori.
            </p>
          </div>
        </div>
      </Reveal>

      <Reveal index={1}>
        <LibrarySearchBar value={query} onChange={setQuery} />
      </Reveal>

      <Reveal index={2}>
        <DoaCategoryFilter
          selected={category}
          onSelect={setCategory}
          showFavoritesOnly={favoritesOnly}
          onToggleFavoritesOnly={() => setFavoritesOnly((prev) => !prev)}
        />
      </Reveal>

      <Reveal index={3}>
        <section className="space-y-3" aria-label="Daftar doa">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-medium text-foreground">
              {isFiltering ? `Hasil pencarian (${filteredItems.length})` : `Semua Doa (${items.length})`}
            </h2>
          </div>

          {filteredItems.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-langit-100 bg-langit-50/40 py-12 text-center">
              <Naniash pose="reflection" size={84} decorative />
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <SearchX className="h-4 w-4" aria-hidden />
              </span>
              <div className="space-y-1 px-6">
                <p className="font-display text-sm font-medium text-foreground">Doa tidak ditemukan</p>
                <p className="mx-auto max-w-xs text-xs text-muted-foreground">
                  Coba kata kunci lain, atau ubah kategori dan filter untuk melihat doa lainnya.
                </p>
              </div>
              {isFiltering && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-xs font-medium text-primary underline-offset-2 hover:underline"
                >
                  Reset pencarian &amp; filter
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredItems.map((doa) => (
                <DoaCard
                  key={doa.slug}
                  doa={doa}
                  isFavorite={favoritesLoaded && favorites.includes(doa.slug)}
                  onToggleFavorite={handleToggleFavorite}
                />
              ))}
            </div>
          )}
        </section>
      </Reveal>
    </div>
  );
}
