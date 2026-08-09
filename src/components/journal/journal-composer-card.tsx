"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Lock } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import type { JournalRecord } from "@/lib/db/models";
import type { SaveTodayInput } from "@/hooks/use-journal";

export interface JournalComposerCardProps {
  todayEntry: JournalRecord | null;
  onSave: (input: SaveTodayInput) => Promise<unknown>;
}

/**
 * "Today's Reflection" — textarea bebas untuk syukur/perasaan/refleksi/
 * catatan perjalanan hari ini. Menyimpan ke entri jurnal hari ini yang
 * sama dengan mood (upsert berdasarkan tanggal, lihat `useJournal.saveToday`).
 */
export function JournalComposerCard({ todayEntry, onSave }: JournalComposerCardProps) {
  const [content, setContent] = React.useState(todayEntry?.content ?? "");
  const [saving, setSaving] = React.useState(false);
  const [justSaved, setJustSaved] = React.useState(false);
  const savedTimeout = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sinkron ulang textarea kalau entri hari ini berubah dari luar (mis. baru dimuat dari IndexedDB).
  React.useEffect(() => {
    setContent(todayEntry?.content ?? "");
  }, [todayEntry?.id, todayEntry?.content]);

  React.useEffect(() => {
    return () => {
      if (savedTimeout.current) clearTimeout(savedTimeout.current);
    };
  }, []);

  const trimmed = content.trim();
  const isUnchanged = trimmed === (todayEntry?.content ?? "").trim();

  async function handleSave() {
    if (trimmed.length === 0 || saving) return;
    setSaving(true);
    try {
      await onSave({ content: trimmed });
      setJustSaved(true);
      if (savedTimeout.current) clearTimeout(savedTimeout.current);
      savedTimeout.current = setTimeout(() => setJustSaved(false), 2200);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader className="pb-0">
        <CardTitle className="text-base">Bagaimana perasaan Bunda hari ini?</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pt-4">
        <Textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="Ceritakan apa yang sedang Bunda rasakan..."
          rows={5}
          maxLength={4000}
        />

        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Lock className="h-3.5 w-3.5 shrink-0" aria-hidden />
            Catatan Bunda tersimpan di perangkat ini.
          </p>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            <AnimatePresence>
              {justSaved && (
                <motion.span
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="flex items-center gap-1 text-xs font-medium text-primary"
                >
                  <Check className="h-3.5 w-3.5" /> Catatan tersimpan
                </motion.span>
              )}
            </AnimatePresence>
            <Button
              type="button"
              size="sm"
              onClick={handleSave}
              disabled={trimmed.length === 0 || saving || isUnchanged}
            >
              {saving ? "Menyimpan..." : "Simpan Catatan"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
