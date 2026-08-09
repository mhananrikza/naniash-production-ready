import { BaseRepository } from "./base.repository";
import type { ChatMessageRecord } from "../models";

/**
 * Repository store `chatHistory` — riwayat percakapan Naniash AI, murni
 * lokal (lihat catatan privasi di `models.ts`). Mengikuti pola repository
 * lain di folder ini (mis. `journal.repository.ts`): tipis, tanpa logika
 * bisnis, hanya query lewat index.
 */
export class ChatHistoryRepository extends BaseRepository<ChatMessageRecord> {
  constructor() {
    super("chatHistory");
  }

  findBySession(sessionId: string): Promise<ChatMessageRecord[]> {
    return this.getByIndex("sessionId", sessionId);
  }
}

export const chatHistoryRepository = new ChatHistoryRepository();
