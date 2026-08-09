"use client";

import * as React from "react";
import { RotateCcw } from "lucide-react";

import { ChatAvatar } from "@/components/sobat-bunda/chat-avatar";
import { ChatBubble, type ChatMessage } from "@/components/sobat-bunda/chat-bubble";
import { TypingIndicator } from "@/components/sobat-bunda/typing-indicator";
import { SuggestedQuestions } from "@/components/sobat-bunda/suggested-questions";
import { EmptyState } from "@/components/sobat-bunda/empty-state";
import { ChatInput } from "@/components/sobat-bunda/chat-input";
import { Badge } from "@/components/ui/badge";
import { formatTime, cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";
import { suggestedQuestions } from "@/config/sobat-bunda";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { createDefaultAiService, type AiMessage } from "@/services/ai";
import { chatHistoryService } from "@/lib/db";
import { createId } from "@/lib/db/utils/id";

/**
 * Halaman Naniash AI — tersambung ke `AiService` (`@/services/ai`):
 * Mode Online (Gemini lewat Netlify Function) bila koneksi tersedia,
 * jatuh ke Mode Offline (Local Content Search) otomatis bila online gagal
 * atau memang sedang tanpa internet. Riwayat percakapan disimpan lokal di
 * IndexedDB (`chatHistoryService`) — tidak pernah dikirim ke server mana pun.
 *
 * Tinggi area chat dihitung mengikuti padding AppShell (`header` 4rem,
 * `main` pt-6, dan pb-24 mobile / pb-10 desktop untuk BottomNav) supaya
 * kolom input tidak perlu scroll ganda dengan halaman.
 */
export default function SobatBundaPage() {
  const isOnline = useOnlineStatus();

  // `AiService` dibuat sekali per mount (bukan per render) — instance ini
  // menyimpan mode aktif ("offline"/"online") di dalam dirinya sendiri.
  const aiServiceRef = React.useRef(createDefaultAiService());

  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [input, setInput] = React.useState("");
  const [isTyping, setIsTyping] = React.useState(false);
  const [errorNotice, setErrorNotice] = React.useState<string | null>(null);
  const [historyReady, setHistoryReady] = React.useState(false);
  const sessionIdRef = React.useRef<string>(createId());
  const bottomRef = React.useRef<HTMLDivElement>(null);

  // Muat riwayat sesi terakhir dari IndexedDB sekali saat halaman dibuka —
  // TIDAK memanggil Gemini di sini (lihat "API EFFICIENCY": jangan request
  // otomatis saat halaman dibuka).
  React.useEffect(() => {
    let cancelled = false;

    async function loadHistory() {
      try {
        const latestSessionId = await chatHistoryService.getLatestSessionId();
        if (!latestSessionId) {
          if (!cancelled) setHistoryReady(true);
          return;
        }
        const records = await chatHistoryService.listBySession(latestSessionId);
        if (cancelled) return;
        sessionIdRef.current = latestSessionId;
        setMessages(
          records.map((record) => ({
            id: record.id,
            role: record.role,
            content: record.content,
            time: formatTime(new Date(record.createdAt)),
          }))
        );
      } catch {
        // IndexedDB tidak tersedia/gagal dibuka — halaman tetap jalan,
        // hanya tanpa riwayat lama (mulai percakapan baru).
      } finally {
        if (!cancelled) setHistoryReady(true);
      }
    }

    loadHistory();
    return () => {
      cancelled = true;
    };
  }, []);

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isTyping]);

  async function handleSend(rawText: string) {
    const text = rawText.trim();
    if (!text || isTyping) return;

    const ai = aiServiceRef.current;
    const sessionId = sessionIdRef.current;

    const userMessage: ChatMessage = {
      id: createId(),
      role: "user",
      content: text,
      time: formatTime(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);
    setErrorNotice(null);

    // Simpan pesan pengguna ke IndexedDB — tidak memblokir UI kalau gagal.
    chatHistoryService.append({ sessionId, role: "user", content: text }).catch(() => {});

    const history: AiMessage[] = messages.map((message) => ({
      role: message.role,
      content: message.content,
    }));

    try {
      const reply = await askWithFallback(ai, { question: text, history }, isOnline);

      const assistantMessage: ChatMessage = {
        id: createId(),
        role: "assistant",
        content: reply.content,
        time: formatTime(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      chatHistoryService
        .append({
          sessionId,
          role: "assistant",
          content: reply.content,
          providerId: reply.providerId,
          mode: reply.mode,
        })
        .catch(() => {});
    } catch (error) {
      // Baik Mode Online maupun Mode Offline sama-sama gagal (mis. index
      // Search Engine offline belum terbangun sama sekali) — tampilkan
      // pesan ramah, aplikasi tetap tidak error/crash.
      setErrorNotice(
        error instanceof Error
          ? error.message
          : "Naniash belum bisa menjawab saat ini. Coba lagi sebentar lagi, ya."
      );
    } finally {
      setIsTyping(false);
    }
  }

  function handleClearConversation() {
    setMessages([]);
    setErrorNotice(null);
    sessionIdRef.current = createId();
    chatHistoryService.clearAll().catch(() => {});
  }

  const hasMessages = messages.length > 0;

  return (
    <div className="flex h-[calc(100dvh-11.5rem)] min-h-[420px] flex-col md:h-[calc(100dvh-8rem)]">
      {/* Header mini khusus halaman chat */}
      <div className="flex items-center justify-between gap-3 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <ChatAvatar size={44} />
          <div className="min-w-0">
            <p className="font-display text-base font-medium text-foreground">
              {siteConfig.companion.name}
            </p>
            <StatusIndicator isOnline={isOnline} />
          </div>
        </div>

        {hasMessages && (
          <button
            type="button"
            onClick={handleClearConversation}
            aria-label="Hapus percakapan"
            className="flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Percakapan baru
          </button>
        )}
      </div>

      {/* Area percakapan */}
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto py-4">
        {!historyReady ? null : !hasMessages ? (
          <EmptyState questions={suggestedQuestions} onSelect={handleSend} />
        ) : (
          <>
            {messages.map((message) => (
              <ChatBubble key={message.id} message={message} />
            ))}
            {isTyping && <TypingIndicator />}
            {errorNotice && <ErrorNotice message={errorNotice} />}
            <div ref={bottomRef} />
          </>
        )}
      </div>

      {/* Saran pertanyaan ringkas + input, menempel di bawah area chat */}
      <div className="sticky bottom-24 z-10 space-y-2 bg-background/95 pt-2 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:bottom-4">
        {hasMessages && (
          <SuggestedQuestions
            questions={suggestedQuestions}
            onSelect={handleSend}
            variant="chips"
            disabled={isTyping}
          />
        )}
        <ChatInput
          value={input}
          onChange={setInput}
          onSend={() => handleSend(input)}
          disabled={isTyping}
        />
      </div>
    </div>
  );
}

/**
 * Coba Mode Online dulu bila `isOnline`; kalau gagal APA PUN alasannya
 * (network, quota Gemini habis, server error) atau memang sedang offline,
 * jatuh ke Mode Offline (Local Content Search) secara otomatis — sesuai
 * "Jika Gemini gagal atau quota habis: Fallback ke Offline Content Search."
 */
async function askWithFallback(
  ai: ReturnType<typeof createDefaultAiService>,
  input: { question: string; history: AiMessage[] },
  isOnline: boolean
) {
  if (isOnline) {
    try {
      ai.setMode("online");
      return await ai.ask(input);
    } catch {
      // Lanjut ke Mode Offline di bawah — jangan lempar dulu.
    }
  }

  ai.setMode("offline");
  return ai.ask(input);
}

function StatusIndicator({ isOnline }: { isOnline: boolean }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "border-none px-0 py-0 text-xs font-normal",
        isOnline ? "text-emerald-600 dark:text-emerald-400" : "text-sky-600 dark:text-sky-400"
      )}
    >
      <span
        className={cn("h-1.5 w-1.5 rounded-full", isOnline ? "bg-emerald-500" : "bg-sky-500")}
        aria-hidden
      />
      {isOnline ? "Naniash Online" : "Naniash Offline"}
    </Badge>
  );
}

function ErrorNotice({ message }: { message: string }) {
  return (
    <div className="flex items-end gap-2">
      <ChatAvatar size={28} />
      <div className="max-w-[78%] rounded-2xl rounded-bl-sm border border-destructive/30 bg-destructive/5 px-4 py-2.5 text-sm leading-relaxed text-destructive shadow-sm sm:max-w-[65%]">
        {message}
      </div>
    </div>
  );
}
