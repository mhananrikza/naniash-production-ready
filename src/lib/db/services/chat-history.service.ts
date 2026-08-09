import { chatHistoryRepository } from "../repository/chat-history.repository";
import { createId, nowIso } from "../utils/id";
import type { ChatMessageRecord, ChatMessageRole } from "../models";

export interface ChatMessageInput {
  sessionId: string;
  role: ChatMessageRole;
  content: string;
  providerId?: string;
  mode?: "online" | "offline";
}

/**
 * Layer bisnis untuk riwayat chat Naniash AI. Dipakai halaman
 * `sobat-bunda/page.tsx` untuk memuat percakapan sesi terakhir saat
 * halaman dibuka, menyimpan tiap pesan baru, dan menghapus riwayat lewat
 * "Clear conversation". Tidak pernah memanggil network — 100% IndexedDB.
 */
export const chatHistoryService = {
  /** Seluruh pesan satu sesi, terurut waktu (lama -> baru). */
  async listBySession(sessionId: string): Promise<ChatMessageRecord[]> {
    const messages = await chatHistoryRepository.findBySession(sessionId);
    return messages.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  },

  /** Sesi terakhir yang punya pesan, atau `null` bila belum pernah ada percakapan sama sekali. */
  async getLatestSessionId(): Promise<string | null> {
    const all = await chatHistoryRepository.getAll();
    if (all.length === 0) return null;
    const latest = all.reduce((a, b) => (a.createdAt > b.createdAt ? a : b));
    return latest.sessionId;
  },

  async append(input: ChatMessageInput): Promise<ChatMessageRecord> {
    const record: ChatMessageRecord = {
      id: createId(),
      sessionId: input.sessionId,
      role: input.role,
      content: input.content,
      providerId: input.providerId,
      mode: input.mode,
      createdAt: nowIso(),
    };
    await chatHistoryRepository.put(record);
    return record;
  },

  /** Hapus seluruh riwayat chat (semua sesi) — dipakai tombol "Clear conversation". */
  async clearAll(): Promise<void> {
    await chatHistoryRepository.clear();
  },
};
