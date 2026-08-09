import { BaseRepository } from "./base.repository";
import type { FavoriteRecord, FavoriteType } from "../models";

export class FavoritesRepository extends BaseRepository<FavoriteRecord> {
  constructor() {
    super("favorites");
  }

  findByType(type: FavoriteType): Promise<FavoriteRecord[]> {
    return this.getByIndex("type", type);
  }

  findByRefId(refId: string): Promise<FavoriteRecord[]> {
    return this.getByIndex("refId", refId);
  }
}

export const favoritesRepository = new FavoritesRepository();
