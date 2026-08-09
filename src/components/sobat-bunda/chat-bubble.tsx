import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ChatAvatar } from "@/components/sobat-bunda/chat-avatar";
import { cn } from "@/lib/utils";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  time: string;
}

/**
 * Satu bubble percakapan. Bubble user rata kanan dengan warna primary,
 * bubble Naniash rata kiri dengan avatar bulat di sampingnya — pola
 * standar chat UI, disederhanakan agar konsisten dengan radius besar
 * design system ("lentera").
 */
export function ChatBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex items-end gap-2", isUser && "flex-row-reverse")}>
      {isUser ? (
        <Avatar className="h-7 w-7">
          <AvatarFallback className="text-xs">B</AvatarFallback>
        </Avatar>
      ) : (
        <ChatAvatar size={28} />
      )}

      <div
        className={cn(
          "max-w-[78%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm sm:max-w-[65%]",
          isUser
            ? "rounded-br-sm bg-primary text-primary-foreground"
            : "rounded-bl-sm border border-border bg-card text-card-foreground"
        )}
      >
        <p className="whitespace-pre-line">{message.content}</p>
        <span
          className={cn(
            "mt-1 block text-right text-[10px]",
            isUser ? "text-primary-foreground/70" : "text-muted-foreground"
          )}
        >
          {message.time}
        </span>
      </div>
    </div>
  );
}
