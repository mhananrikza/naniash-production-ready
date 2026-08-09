"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { JournalMoodPicker } from "@/components/journal/journal-mood-picker";
import type { SaveTodayInput } from "@/hooks/use-journal";

export interface JournalTodayMoodCardProps {
  mood: string | null;
  onSave: (input: SaveTodayInput) => Promise<unknown>;
}

/**
 * "Today's Mood" — mood tersimpan seketika saat dipilih (tap-to-save),
 * terpisah dari tombol "Simpan Catatan" di composer refleksi supaya Bunda
 * bisa mencatat perasaan sekilas walau belum sempat menulis panjang.
 */
export function JournalTodayMoodCard({ mood, onSave }: JournalTodayMoodCardProps) {
  const [saving, setSaving] = React.useState(false);
  const [justSaved, setJustSaved] = React.useState(false);
  const savedTimeout = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    return () => {
      if (savedTimeout.current) clearTimeout(savedTimeout.current);
    };
  }, []);

  async function handleSelect(label: string, emoji: string) {
    setSaving(true);
    try {
      await onSave({ mood: label, moodEmoji: emoji });
      setJustSaved(true);
      if (savedTimeout.current) clearTimeout(savedTimeout.current);
      savedTimeout.current = setTimeout(() => setJustSaved(false), 1800);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-0">
        <CardTitle className="text-base">Mood Hari Ini</CardTitle>
        <AnimatePresence>
          {justSaved && (
            <motion.span
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="flex items-center gap-1 text-xs font-medium text-primary"
            >
              <Check className="h-3.5 w-3.5" /> Tersimpan
            </motion.span>
          )}
        </AnimatePresence>
      </CardHeader>
      <CardContent className="space-y-3 pt-4">
        <p className="text-sm text-muted-foreground">
          Ketuk salah satu — akan tersimpan otomatis di perangkat ini.
        </p>
        <JournalMoodPicker value={mood} onChange={handleSelect} className={saving ? "opacity-70" : undefined} />
      </CardContent>
    </Card>
  );
}
