import { BaseRepository } from "./base.repository";
import type { SearchDocumentRecord } from "../models";

export class SearchDocumentsRepository extends BaseRepository<SearchDocumentRecord> {
  constructor() {
    super("searchDocuments");
  }

  findByType(type: SearchDocumentRecord["type"]): Promise<SearchDocumentRecord[]> {
    return this.getByIndex("type", type);
  }

  findByCategory(category: string): Promise<SearchDocumentRecord[]> {
    return this.getByIndex("category", category);
  }

  /** Cocok karena index `tags` dibuat `multiEntry` — satu dokumen dengan 3 tag otomatis "terdaftar" di 3 entri index ini. */
  findByTag(tag: string): Promise<SearchDocumentRecord[]> {
    return this.getByIndex("tags", tag);
  }

  /** Ganti seluruh isi store dalam satu langkah — dipakai saat index dibangun ulang. */
  async replaceAll(records: SearchDocumentRecord[]): Promise<void> {
    await this.clear();
    await this.bulkPut(records);
  }
}

export const searchDocumentsRepository = new SearchDocumentsRepository();
