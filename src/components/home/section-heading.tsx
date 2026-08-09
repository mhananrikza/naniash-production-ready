import Link from "next/link";
import { ChevronRight } from "lucide-react";

export interface SectionHeadingProps {
  title: string;
  href?: string;
  linkLabel?: string;
}

/**
 * Header kecil "judul + Lihat semua" — dipakai berulang di kartu-kartu
 * Home (Doa Hari Ini, Journal, dst.) supaya pola konsisten dan tidak
 * ditulis ulang tiap komponen.
 */
export function SectionHeading({ title, href, linkLabel = "Lihat semua" }: SectionHeadingProps) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="font-display text-base font-medium tracking-tight text-foreground">{title}</h2>
      {href ? (
        <Link
          href={href}
          className="flex items-center gap-0.5 text-xs font-medium text-primary hover:underline"
        >
          {linkLabel}
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      ) : null}
    </div>
  );
}
