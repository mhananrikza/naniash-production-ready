/**
 * Skema database lokal (IndexedDB) — satu-satunya tempat yang tahu nama
 * database, versi, serta object store & index apa saja yang ada.
 *
 * `connection.ts` memakai skema ini untuk menjalankan migrasi saat event
 * `upgradeneeded`. Modul lain tidak perlu (dan sebaiknya tidak) tahu
 * detail di file ini — cukup pakai `StoreName` atau repository terkait.
 */

export const DB_NAME = "hadiah-dari-langit";

/** Nama seluruh object store. Tambah di sini + buat migrasi baru bila perlu store baru. */
export const STORE_NAMES = [
  "favorites",
  "journal",
  "progress",
  "challenge",
  "settings",
  "reminder",
  "reminderSchedule",
  "readingHistory",
  "dailyJourney",
  "searchDocuments",
  "searchTerms",
  "searchHistory",
  "searchStats",
  "chatHistory",
] as const;

export type StoreName = (typeof STORE_NAMES)[number];

interface IndexDefinition {
  name: string;
  keyPath: string | string[];
  options?: IDBIndexParameters;
}

interface StoreDefinition {
  name: StoreName;
  keyPath: string;
  indexes?: IndexDefinition[];
}

interface Migration {
  /** Versi database setelah migrasi ini selesai dijalankan. */
  version: number;
  /**
   * Dijalankan di dalam event `upgradeneeded` (transaksi `versionchange`).
   * Hanya boleh berisi operasi skema (createObjectStore/createIndex),
   * bukan operasi data biasa.
   */
  run: (db: IDBDatabase, transaction: IDBTransaction) => void;
}

/**
 * Riwayat migrasi. Aturan main: JANGAN mengubah migrasi yang sudah pernah
 * dirilis — selalu tambah entri baru dengan `version` berikutnya, supaya
 * pengguna dengan database lama tetap ter-upgrade dengan benar.
 */
const MIGRATIONS: Migration[] = [
  {
    version: 1,
    run(db) {
      const stores: StoreDefinition[] = [
        {
          name: "favorites",
          keyPath: "id",
          indexes: [
            { name: "type", keyPath: "type" },
            { name: "refId", keyPath: "refId" },
            { name: "createdAt", keyPath: "createdAt" },
          ],
        },
        {
          name: "journal",
          keyPath: "id",
          indexes: [
            { name: "date", keyPath: "date" },
            { name: "createdAt", keyPath: "createdAt" },
          ],
        },
        {
          name: "progress",
          keyPath: "id",
          indexes: [{ name: "updatedAt", keyPath: "updatedAt" }],
        },
        {
          name: "challenge",
          keyPath: "id",
          indexes: [{ name: "updatedAt", keyPath: "updatedAt" }],
        },
        {
          name: "settings",
          keyPath: "key",
        },
        {
          name: "reminder",
          keyPath: "id",
          indexes: [
            { name: "type", keyPath: "type" },
            { name: "enabled", keyPath: "enabled" },
          ],
        },
        {
          name: "readingHistory",
          keyPath: "id",
          indexes: [
            { name: "updatedAt", keyPath: "updatedAt" },
            { name: "completed", keyPath: "completed" },
          ],
        },
      ];

      for (const store of stores) {
        if (db.objectStoreNames.contains(store.name)) continue;
        const objectStore = db.createObjectStore(store.name, { keyPath: store.keyPath });
        for (const index of store.indexes ?? []) {
          objectStore.createIndex(index.name, index.keyPath, index.options);
        }
      }
    },
  },
  {
    // Store untuk Search Engine lokal (lihat `src/lib/db/services/search/`
    // untuk penjelasan lengkap strategi indexing-nya).
    version: 2,
    run(db) {
      const stores: StoreDefinition[] = [
        {
          // Metadata tiap dokumen yang bisa dicari (doa/dzikir/afirmasi/
          // artikel) — dipakai untuk menampilkan hasil pencarian setelah
          // id-nya ditemukan lewat `searchTerms`. `type` & `category`
          // punya index sendiri untuk filter cepat; `tags` pakai
          // `multiEntry` supaya satu dokumen dengan banyak tag bisa
          // ditemukan lewat index yang sama tanpa duplikasi record.
          name: "searchDocuments",
          keyPath: "id",
          indexes: [
            { name: "type", keyPath: "type" },
            { name: "category", keyPath: "category" },
            { name: "tags", keyPath: "tags", options: { multiEntry: true } },
          ],
        },
        {
          // Inverted index: satu record per token unik, berisi daftar
          // dokumen (posting list) yang mengandung token tsb. `keyPath`
          // langsung berupa token (bukan id numerik) supaya bisa
          // di-query dengan `IDBKeyRange.bound(prefix, prefix + "\uffff")`
          // untuk pencarian awalan (prefix search) tanpa index tambahan —
          // IndexedDB selalu menyimpan key string terurut secara leksikal.
          name: "searchTerms",
          keyPath: "term",
        },
        {
          // Riwayat pencarian mentah (satu record per pencarian yang
          // dijalankan). Sumber untuk "Recent Search" (diurutkan
          // `createdAt`) sekaligus bahan agregasi "Popular Search" lewat
          // `searchStats`.
          name: "searchHistory",
          keyPath: "id",
          indexes: [
            { name: "normalizedQuery", keyPath: "normalizedQuery" },
            { name: "createdAt", keyPath: "createdAt" },
          ],
        },
        {
          // Agregat per query ternormalisasi — satu record per query unik
          // dengan counter `count` yang bertambah tiap kali dicari.
          // Dipisah dari `searchHistory` supaya "Popular Search" tidak
          // perlu menghitung ulang (scan + reduce) seluruh riwayat setiap
          // kali diminta, cukup baca store ini dan urutkan berdasarkan
          // index `count`.
          name: "searchStats",
          keyPath: "query",
          indexes: [
            { name: "count", keyPath: "count" },
            { name: "lastUsedAt", keyPath: "lastUsedAt" },
          ],
        },
      ];

      for (const store of stores) {
        if (db.objectStoreNames.contains(store.name)) continue;
        const objectStore = db.createObjectStore(store.name, { keyPath: store.keyPath });
        for (const index of store.indexes ?? []) {
          objectStore.createIndex(index.name, index.keyPath, index.options);
        }
      }
    },
  },
  {
    // Rombak `readingHistory` jadi fondasi "Continue Reading" yang generik
    // lintas jenis konten (bukan cuma artikel Perpustakaan) — lihat
    // `src/lib/db/services/reading-history.service.ts`.
    //
    // Ini PERUBAHAN STRUKTUR (`keyPath` berubah dari slug polos jadi kunci
    // komposit `${type}:${slug}`, lihat `ReadingHistoryRecord` di
    // `models.ts`), jadi store lama dihapus & dibuat ulang alih-alih
    // ditambah index saja. Ini juga sekalian memperbaiki bug versi
    // sebelumnya: index bernama "updatedAt" dibuat di sana padahal field
    // record-nya bernama `lastReadAt` (index itu jadi tidak pernah cocok
    // dengan data manapun) — di sini index dibuat dengan nama yang benar.
    version: 3,
    run(db) {
      if (db.objectStoreNames.contains("readingHistory")) {
        db.deleteObjectStore("readingHistory");
      }

      const objectStore = db.createObjectStore("readingHistory", { keyPath: "id" });
      objectStore.createIndex("type", "type");
      objectStore.createIndex("slug", "slug");
      objectStore.createIndex("lastReadAt", "lastReadAt");
      objectStore.createIndex("completed", "completed");
    },
  },
  {
    // Store untuk Daily Journey Engine — satu record per tanggal berisi id
    // materi yang terpilih (lihat `DailyJourneyRecord` di `models.ts`) dan
    // status selesainya. Lihat `src/services/daily-journey/` untuk
    // algoritma pemilihan & `src/lib/db/services/daily-journey.service.ts`
    // untuk logika baca/tulisnya.
    version: 4,
    run(db) {
      if (db.objectStoreNames.contains("dailyJourney")) return;

      const objectStore = db.createObjectStore("dailyJourney", { keyPath: "id" });
      objectStore.createIndex("generatedAt", "generatedAt");
      objectStore.createIndex("completedAt", "completedAt");
    },
  },
  {
    // Store untuk Reminder Engine — satu record per jenis reminder bawaan
    // ("doa" | "journal") berisi jadwal berikutnya. Lihat `ReminderScheduleRecord`
    // di `models.ts` untuk alasan store ini terpisah dari `reminder` (daftar
    // pengingat generik buatan pengguna). Jadwal di sini TETAP disimpan
    // walau browser tidak mendukung Notification API sama sekali — lihat
    // `src/services/reminder-engine/`.
    version: 5,
    run(db) {
      if (db.objectStoreNames.contains("reminderSchedule")) return;

      const objectStore = db.createObjectStore("reminderSchedule", { keyPath: "id" });
      objectStore.createIndex("nextFireAt", "nextFireAt");
    },
  },
  {
    // Store untuk riwayat chat Naniash AI (`src/services/ai/`) — murni lokal,
    // tidak pernah disinkronkan ke server. Additive: tidak menyentuh store
    // lain yang sudah ada. Lihat `ChatMessageRecord` di `models.ts` dan
    // `src/lib/db/repository/chat-history.repository.ts`.
    version: 6,
    run(db) {
      if (db.objectStoreNames.contains("chatHistory")) return;

      const objectStore = db.createObjectStore("chatHistory", { keyPath: "id" });
      objectStore.createIndex("sessionId", "sessionId");
      objectStore.createIndex("createdAt", "createdAt");
    },
  },
];

export const DB_VERSION = MIGRATIONS.reduce((max, m) => Math.max(max, m.version), 0);

/** Menjalankan seluruh migrasi yang versinya lebih baru dari `fromVersion`, berurutan. */
export function runMigrations(db: IDBDatabase, transaction: IDBTransaction, fromVersion: number): void {
  for (const migration of MIGRATIONS) {
    if (migration.version > fromVersion) {
      migration.run(db, transaction);
    }
  }
}
