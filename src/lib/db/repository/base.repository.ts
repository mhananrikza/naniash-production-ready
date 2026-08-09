import { getDatabase, type StoreName } from "../database";
import { promisifyRequest, promisifyTransaction } from "../database/idb-utils";
import { dbEvents } from "../events";
import { RecordNotFoundError } from "../errors";

/**
 * Repository generik untuk satu object store. Setiap repository domain
 * (favorites, journal, dst. — lihat file `*.repository.ts` di folder ini)
 * meng-extend kelas ini dan hanya menambah query khusus lewat index;
 * operasi CRUD dasar sudah tersedia di sini dan tidak perlu ditulis ulang.
 *
 * `T` adalah tipe record (lihat `../models.ts`), `K` adalah tipe primary
 * key-nya (default `string`).
 */
export class BaseRepository<T, K extends IDBValidKey = string> {
  constructor(protected readonly storeName: StoreName) {}

  /** `protected`, bukan `private`: dipakai turunan yang butuh query kustom (mis. range query index) di luar method dasar di sini. */
  protected async openStore(
    mode: IDBTransactionMode
  ): Promise<{ store: IDBObjectStore; transaction: IDBTransaction }> {
    const db = await getDatabase();
    const transaction = db.transaction(this.storeName, mode);
    return { store: transaction.objectStore(this.storeName), transaction };
  }

  async getAll(): Promise<T[]> {
    const { store } = await this.openStore("readonly");
    return promisifyRequest(store.getAll() as IDBRequest<T[]>);
  }

  async getById(id: K): Promise<T | undefined> {
    const { store } = await this.openStore("readonly");
    return promisifyRequest(store.get(id) as IDBRequest<T | undefined>);
  }

  /** Seperti `getById`, tapi melempar `RecordNotFoundError` bila tidak ada. */
  async requireById(id: K): Promise<T> {
    const record = await this.getById(id);
    if (record === undefined) throw new RecordNotFoundError(this.storeName, id);
    return record;
  }

  async getByIndex(indexName: string, value: IDBValidKey): Promise<T[]> {
    const { store } = await this.openStore("readonly");
    return promisifyRequest(store.index(indexName).getAll(value) as IDBRequest<T[]>);
  }

  async getOneByIndex(indexName: string, value: IDBValidKey): Promise<T | undefined> {
    const { store } = await this.openStore("readonly");
    return promisifyRequest(store.index(indexName).get(value) as IDBRequest<T | undefined>);
  }

  /** Tambah atau timpa satu record (upsert berdasarkan keyPath). */
  async put(record: T): Promise<K> {
    const { store, transaction } = await this.openStore("readwrite");
    const key = await promisifyRequest(store.put(record) as unknown as IDBRequest<K>);
    await promisifyTransaction(transaction);
    dbEvents.emit(this.storeName);
    return key;
  }

  /** Upsert beberapa record sekaligus dalam satu transaksi. */
  async bulkPut(records: T[]): Promise<void> {
    if (records.length === 0) return;
    const { store, transaction } = await this.openStore("readwrite");
    for (const record of records) store.put(record);
    await promisifyTransaction(transaction);
    dbEvents.emit(this.storeName);
  }

  async delete(id: K): Promise<void> {
    const { store, transaction } = await this.openStore("readwrite");
    store.delete(id);
    await promisifyTransaction(transaction);
    dbEvents.emit(this.storeName);
  }

  /** Menghapus seluruh isi store — dipakai fitur "hapus data lokal". */
  async clear(): Promise<void> {
    const { store, transaction } = await this.openStore("readwrite");
    store.clear();
    await promisifyTransaction(transaction);
    dbEvents.emit(this.storeName);
  }

  async count(): Promise<number> {
    const { store } = await this.openStore("readonly");
    return promisifyRequest(store.count());
  }
}
