"use client";

import * as React from "react";
import { Sun, SearchX } from "lucide-react";

import { Naniash } from "@/components/naniash/naniash";
import { Reveal } from "@/components/ui/reveal";
import { LibrarySearchBar } from "@/components/library/library-search-bar";
import {
  AfirmasiCategoryFilter,
  ALL_AFIRMASI_CATEGORY_SLUG,
} from "@/components/afirmasi/afirmasi-category-filter";
import { AfirmasiCard, type AfirmasiContentMeta } from "@/components/afirmasi/afirmasi-card";
import { isIndexedDbSupported, favoritesService } from "@/lib/db";

export interface AfirmasiPageClientProps {
  items: AfirmasiContentMeta[];
}

/**
 * Client Component halaman `/afirmasi`. Data afirmasi datang dari
 * Content Engine lewat Server Component induk (`getAllContent({ type:
 * "afirmasi" })`) — komponen ini sendiri tidak membaca `fs`, hanya
 * mengelola state UI (search, filter kategori, favorit). Pola identik
 * `DoaPageClient`/`DzikirPageClient`, hanya field yang dicocokkan saat
 * pencarian disesuaikan (`AfirmasiContent` tidak punya `context`).
 *
 * Favorit disimpan lewat `favoritesService` (IndexedDB, tipe
 * `"afirmasi"`).
 */
export function AfirmasiPageClient({ items }: AfirmasiPageClientProps) {
  const [query, setQuery] = React.useState("");
  const [category, setCategory] = React.useState(ALL_AFIRMASI_CATEGORY_SLUG);
  const [favoritesOnly, setFavoritesOnly] = React.useState(false);
  const [favorites, setFavorites] = React.useState<string[]>([]);
  const [favoritesLoaded, setFavoritesLoaded] = React.useState(false);

  React.useEffect(() => {
    if (!isIndexedDbSupported()) return;
    let cancelled = false;

    favoritesService.list("afirmasi").then((records) => {
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
      await favoritesService.toggle("afirmasi", slug);
    } catch {
      setFavorites((prev) => (prev.includes(slug) ? prev.filter((item) => item !== slug) : [...prev, slug]));
    }
  }

  const normalizedQuery = query.trim().toLowerCase();

  const filteredItems = React.useMemo(() => {
    return items.filter((afirmasi) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        afirmasi.title.toLowerCase().includes(normalizedQuery) ||
        afirmasi.excerpt.toLowerCase().includes(normalizedQuery) ||
        afirmasi.text.toLowerCase().includes(normalizedQuery) ||
        afirmasi.tags.some((tag) => tag.toLowerCase().includes(normalizedQuery));

      const matchesCategory = category === ALL_AFIRMASI_CATEGORY_SLUG || afirmasi.category === category;
      const matchesFavorite = !favoritesOnly || favorites.includes(afirmasi.slug);

      return matchesQuery && matchesCategory && matchesFavorite;
    });
  }, [items, normalizedQuery, category, favoritesOnly, favorites]);

  const isFiltering = normalizedQuery.length > 0 || category !== ALL_AFIRMASI_CATEGORY_SLUG || favoritesOnly;

  function handleResetFilters() {
    setQuery("");
    setCategory(ALL_AFIRMASI_CATEGORY_SLUG);
    setFavoritesOnly(false);
  }

  return (
    <div className="space-y-6 pb-4">
      <Reveal index={0}>
        <div className="relative flex items-center gap-4 overflow-hidden rounded-[1.75rem] bg-senja-100 px-5 py-5 sm:px-7 sm:py-6">
          <div
            className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-senja-300/40 blur-xl"
            aria-hidden
          />
          <Naniash pose="open-hands" size={92} priority className="relative shrink-0" />
          <div className="relative space-y-1">
            <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-senja-700">
              <Sun className="h-3.5 w-3.5" aria-hidden />
              Afirmasi
            </p>
            <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
              Afirmasi untuk Bunda
            </h1>
            <p className="text-sm text-muted-foreground">
              Kalimat penguat hati untuk perjalanan mengasuh — cari berdasarkan topik, atau jelajahi per
              kategori.
            </p>
          </div>
        </div>
      </Reveal>

      <Reveal index={1}>
        <LibrarySearchBar value={query} onChange={setQuery} />
      </Reveal>

      <Reveal index={2}>
        <AfirmasiCategoryFilter
          selected={category}
          onSelect={setCategory}
          showFavoritesOnly={favoritesOnly}
          onToggleFavoritesOnly={() => setFavoritesOnly((prev) => !prev)}
        />
      </Reveal>

      <Reveal index={3}>
        <section className="space-y-3" aria-label="Daftar afirmasi">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-medium text-foreground">
              {isFiltering ? `Hasil pencarian (${filteredItems.length})` : `Semua Afirmasi (${items.length})`}
            </h2>
          </div>

          {filteredItems.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-senja-100 bg-senja-100/30 py-12 text-center">
              <Naniash pose="open-hands" size={84} decorative />
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <SearchX className="h-4 w-4" aria-hidden />
              </span>
              <div className="space-y-1 px-6">
                <p className="font-display text-sm font-medium text-foreground">Afirmasi tidak ditemukan</p>
                <p className="mx-auto max-w-xs text-xs text-muted-foreground">
                  Coba kata kunci lain, atau ubah kategori dan filter untuk melihat afirmasi lainnya.
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
              {filteredItems.map((afirmasi) => (
                <AfirmasiCard
                  key={afirmasi.slug}
                  afirmasi={afirmasi}
                  isFavorite={favoritesLoaded && favorites.includes(afirmasi.slug)}
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
