/**
 * Konten statis (bukan hasil query) untuk Home Dashboard — hanya untuk
 * bagian yang memang belum punya sumber data lokal (AI Sobat Bunda,
 * prompt/mood Journal). Semua bagian yang datanya SUDAH tersedia di
 * Content Engine/IndexedDB (Daily Journey, Doa Hari Ini, Continue Reading,
 * Challenge, streak) TIDAK lagi didefinisikan di sini — lihat masing-masing
 * hook di `@/hooks` dan service di `@/lib/db`.
 */

export const aiSobatBundaContent = {
  greeting: "Ada sesuatu yang ingin Bunda ceritakan hari ini?",
};

export const journalContent = {
  prompt: "Apa satu hal kecil yang membuat Bunda bersyukur hari ini?",
  moods: [
    { emoji: "😌", label: "Tenang" },
    { emoji: "🥹", label: "Terharu" },
    { emoji: "😔", label: "Lelah" },
    { emoji: "🙏", label: "Bersyukur" },
  ],
};
