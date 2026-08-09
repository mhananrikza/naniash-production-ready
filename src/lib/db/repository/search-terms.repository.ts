import { promisifyRequest, promisifyTransaction } from "../database/idb-utils";
import { BaseRepository } from "./base.repository";
import type { SearchTermRecord } from "../models";

/**
 * Batas jumlah record per transaksi `bulkPut` saat menulis ulang seluruh
 * inverted index. IndexedDB tidak keberatan dengan transaksi besar, tapi
 * memecahnya jadi beberapa transaksi lebih kecil membuat UI tetap responsif
 * (event loop tidak diblokir satu transaksi raksasa) — penting terutama
 * saat "artikel bertambah banyak" dan jumlah token unik ikut membesar.
 */
const REPLACE_ALL_CHUNK_SIZE = 500;

export class SearchTermsRepository extends BaseRepository<SearchTermRecord, string> {
  constructor() {
    super("searchTerms");
  }

  /**
   * Cari seluruh token yang DIAWALI `prefix` — inti dari prefix search.
   * Karena `keyPath` store ini adalah token itu sendiri, dan IndexedDB
   * selalu menyimpan primary key string dalam urutan leksikal (UTF-16 code
   * unit), rentang `[prefix, prefix + "\uffff"]` selalu memuat *tepat*
   * seluruh token yang diawali `prefix` — tanpa perlu index tambahan atau
   * scan seluruh store. Ini yang membuat pencarian tetap cepat walau
   * jumlah token bertambah banyak: biaya query sebanding dengan jumlah
   * token yang cocok, bukan total token di database.
   */
  async findByPrefix(prefix: string, limit?: number): Promise<SearchTermRecord[]> {
    if (!prefix) return [];
    const { store } = await this.openStore("readonly");
    const range = IDBKeyRange.bound(prefix, `${prefix}\uffff`);
    const request =
      typeof limit === "number"
        ? store.getAll(range, limit)
        : store.getAll(range);
    return promisifyRequest(request as IDBRequest<SearchTermRecord[]>);
  }

  /** Ambil satu token secara persis (exact match) — lebih murah daripada `findByPrefix` untuk kasus ini. */
  findExact(term: string): Promise<SearchTermRecord | undefined> {
    return this.getById(term);
  }

  /** Ganti seluruh isi store dalam beberapa transaksi kecil — dipakai saat index dibangun ulang. */
  async replaceAll(records: SearchTermRecord[]): Promise<void> {
    await this.clear();

    for (let i = 0; i < records.length; i += REPLACE_ALL_CHUNK_SIZE) {
      const chunk = records.slice(i, i + REPLACE_ALL_CHUNK_SIZE);
      const { store, transaction } = await this.openStore("readwrite");
      for (const record of chunk) store.put(record);
      await promisifyTransaction(transaction);
    }
  }
}

export const searchTermsRepository = new SearchTermsRepository();
