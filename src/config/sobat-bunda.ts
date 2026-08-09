/**
 * Data contoh untuk halaman AI Sobat Bunda (belum tersambung ke API
 * sungguhan). `getDummyReply` melakukan pencocokan kata kunci sederhana
 * supaya interaksi terasa relevan saat didemokan, sebelum diganti
 * pemanggilan LLM asli.
 */

export const suggestedQuestions: string[] = [
  "Doa apa yang baik dibaca saat anak sedang sakit?",
  "Bagaimana menenangkan hati saat cemas memikirkan masa depan anak?",
  "Ajarkan aku afirmasi positif untuk pagi ini",
  "Apa arti sabar dalam mendidik anak menurut Islam?",
];

interface DummyReplyEntry {
  keywords: string[];
  reply: string;
}

const dummyReplies: DummyReplyEntry[] = [
  {
    keywords: ["sakit", "demam", "sehat", "sembuh"],
    reply:
      'Salah satu doa yang sering dibaca saat anak sakit, sambil mengusap bagian yang sakit:\n\n"Allahumma Rabban naas, adzhibil ba\'s, isyfi antasy-syaafi, laa syifaa\'a illaa syifaa\'uk, syifaa\'an laa yughaadiru saqamaa."\n\nArtinya kurang lebih: Ya Allah, Tuhan manusia, hilangkanlah penyakit ini, sembuhkanlah, karena Engkaulah yang Maha Menyembuhkan. Semoga si kecil segera pulih, Bunda 🤍',
  },
  {
    keywords: ["cemas", "khawatir", "takut", "was-was"],
    reply:
      'Wajar sekali Bunda merasa cemas — itu tanda betapa besar sayangnya Bunda pada si kecil. Coba tarik napas perlahan, lalu ucapkan: "Hasbunallahu wa ni\'mal wakiil" (Cukuplah Allah menjadi penolong kami). Rasa was-was boleh muncul, tapi jangan biarkan ia menetap terlalu lama, ya.',
  },
  {
    keywords: ["afirmasi", "semangat", "pagi", "motivasi"],
    reply:
      'Ini afirmasi untuk pagi ini, Bunda:\n\n"Aku adalah ibu yang cukup baik. Aku belajar setiap hari, dan itu sudah luar biasa. Hari ini aku memilih tenang, hadir, dan penuh kasih untuk anakku."\n\nBoleh diucapkan pelan-pelan sambil menatap cermin sebelum memulai hari 🌤️',
  },
  {
    keywords: ["sabar", "mendidik", "marah", "emosi"],
    reply:
      "Sabar dalam mendidik anak bukan berarti diam menahan semua rasa, tapi memilih respons paling baik meski hati sedang penuh. Rasulullah SAW mengajarkan bahwa sebaik-baik kalian adalah yang paling lembut pada keluarganya. Pelan-pelan saja, Bunda — tidak perlu sempurna, cukup terus berusaha.",
  },
];

const fallbackReply =
  "Terima kasih sudah bercerita, Bunda. Ini baru tampilan contoh dariku — begitu tersambung nanti, aku akan menjawab lebih lengkap. Untuk sekarang, anggap saja aku menemani sambil menyiapkan jawaban terbaik ya 🤍";

/**
 * Cari balasan contoh berdasarkan kata kunci di pertanyaan. Jatuh ke
 * `fallbackReply` bila tidak ada yang cocok.
 */
export function getDummyReply(question: string): string {
  const lower = question.toLowerCase();
  const match = dummyReplies.find((entry) => entry.keywords.some((keyword) => lower.includes(keyword)));
  return match?.reply ?? fallbackReply;
}
