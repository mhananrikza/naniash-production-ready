"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { todayDateKey } from "@/lib/db/utils/id";

export interface JournalCalendarProps {
  /** Tanggal (`YYYY-MM-DD`) yang punya minimal satu entri — ditandai titik kecil. */
  entryDates: Set<string>;
  selectedDate: string | null;
  onSelectDate: (dateKey: string) => void;
}

const WEEKDAY_LABELS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Grid hari dalam satu bulan, minggu dimulai Senin, termasuk sel kosong pengisi awal/akhir. */
function buildMonthGrid(viewDate: Date): Array<{ date: Date; inMonth: boolean } | null> {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // getDay(): 0=Minggu..6=Sabtu → geser supaya 0=Senin..6=Minggu.
  const leadingBlanks = (firstOfMonth.getDay() + 6) % 7;

  const cells: Array<{ date: Date; inMonth: boolean } | null> = [];
  for (let i = 0; i < leadingBlanks; i++) cells.push(null);
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({ date: new Date(year, month, day), inMonth: true });
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export function JournalCalendar({ entryDates, selectedDate, onSelectDate }: JournalCalendarProps) {
  const [viewDate, setViewDate] = React.useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const today = todayDateKey();
  const cells = React.useMemo(() => buildMonthGrid(viewDate), [viewDate]);
  const monthLabel = viewDate.toLocaleDateString("id-ID", { month: "long", year: "numeric" });

  function goPrevMonth() {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  }
  function goNextMonth() {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base capitalize">{monthLabel}</CardTitle>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={goPrevMonth} aria-label="Bulan sebelumnya">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={goNextMonth} aria-label="Bulan berikutnya">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-medium text-muted-foreground">
          {WEEKDAY_LABELS.map((label) => (
            <span key={label}>{label}</span>
          ))}
        </div>
        <div className="mt-1.5 grid grid-cols-7 gap-1">
          {cells.map((cell, index) => {
            if (!cell) return <div key={`blank-${index}`} aria-hidden />;

            const dateKey = toDateKey(cell.date);
            const hasEntry = entryDates.has(dateKey);
            const isToday = dateKey === today;
            const isSelected = dateKey === selectedDate;

            return (
              <button
                key={dateKey}
                type="button"
                onClick={() => onSelectDate(dateKey)}
                aria-current={isToday ? "date" : undefined}
                aria-pressed={isSelected}
                className={cn(
                  "relative flex aspect-square flex-col items-center justify-center gap-0.5 rounded-lg text-xs transition-colors",
                  isSelected
                    ? "bg-primary text-primary-foreground font-semibold"
                    : isToday
                      ? "border border-primary/50 text-foreground"
                      : "text-foreground hover:bg-muted"
                )}
              >
                {cell.date.getDate()}
                <span
                  className={cn(
                    "h-1 w-1 rounded-full",
                    hasEntry ? (isSelected ? "bg-primary-foreground" : "bg-primary") : "bg-transparent"
                  )}
                  aria-hidden
                />
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
