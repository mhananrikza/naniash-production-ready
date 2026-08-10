import { favoritesRepository } from "../repository/favorites.repository";
import { nowIso } from "../utils/id";
import type { FavoriteRecord, FavoriteType } from "../models";

function makeId(type: FavoriteType, refId: string): string {
  return `${type}:${refId}`;
}

/**
 * Layer bisnis untuk item favorit — SATU sumber kebenaran untuk seluruh
 * aplikasi (IndexedDB, bukan localStorage). Dipakai lewat `useContentFavorite`
 * (satu item, halaman Reader) dan `useContentFavorites` (banyak item,
 * Perpustakaan & Favorit); `useLibraryFavorites` (localStorage, versi lama
 * khusus artikel) sudah dihapus.
 */
export const favoritesService = {
  /** Daftar favorit, opsional difilter per tipe, terbaru lebih dulu. */
  async list(type?: FavoriteType): Promise<FavoriteRecord[]> {
    const all = type ? await favoritesRepository.findByType(type) : await favoritesRepository.getAll();
    return all.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  async isFavorite(type: FavoriteType, refId: string): Promise<boolean> {
    const record = await favoritesRepository.getById(makeId(type, refId));
    return record !== undefined;
  },

  async add(type: FavoriteType, refId: string): Promise<FavoriteRecord> {
    const record: FavoriteRecord = { id: makeId(type, refId), type, refId, createdAt: nowIso() };
    await favoritesRepository.put(record);
    return record;
  },

  async remove(type: FavoriteType, refId: string): Promise<void> {
    await favoritesRepository.delete(makeId(type, refId));
  },

  /** Membalik status favorit satu entitas, mengembalikan status baru (true = kini favorit). */
  async toggle(type: FavoriteType, refId: string): Promise<boolean> {
    const isFav = await favoritesService.isFavorite(type, refId);
    if (isFav) {
      await favoritesService.remove(type, refId);
      return false;
    }
    await favoritesService.add(type, refId);
    return true;
  },
};
