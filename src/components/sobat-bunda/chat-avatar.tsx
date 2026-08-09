import { Naniash, type NaniashPose } from "@/components/naniash/naniash";
import { cn } from "@/lib/utils";

export interface ChatAvatarProps {
  size?: number;
  className?: string;
  /** Default "welcome" (avatar chat standar). Ganti mis. ke "listening" saat AI sedang memproses. */
  pose?: NaniashPose;
}

/**
 * Bingkai lingkaran untuk Naniash versi kecil — dipakai di
 * header chat dan tiap chat bubble asisten supaya identitas Naniash
 * tetap konsisten tanpa menggambar ulang SVG-nya di tiap tempat.
 */
export function ChatAvatar({ size = 32, className, pose = "welcome" }: ChatAvatarProps) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-cahaya-100 dark:bg-cahaya-700/20",
        className
      )}
      style={{ width: size, height: size }}
    >
      <Naniash pose={pose} size={size * 0.72} />
    </div>
  );
}
