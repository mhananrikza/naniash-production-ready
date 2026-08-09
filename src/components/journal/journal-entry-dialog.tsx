"use client";

import * as React from "react";
import { Pencil, Trash2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { JournalMoodPicker } from "@/components/journal/journal-mood-picker";
import { formatJournalDateLong } from "@/config/journal";
import type { JournalRecord } from "@/lib/db/models";

type Mode = "view" | "edit" | "confirm-delete";

export interface JournalEntryDialogProps {
  entry: JournalRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (id: string, patch: { mood?: string | null; moodEmoji?: string | null; content?: string }) => Promise<unknown>;
  onDelete: (id: string) => Promise<unknown>;
}

export function JournalEntryDialog({ entry, open, onOpenChange, onSave, onDelete }: JournalEntryDialogProps) {
  const [mode, setMode] = React.useState<Mode>("view");
  const [content, setContent] = React.useState("");
  const [mood, setMood] = React.useState<string | null>(null);
  const [moodEmoji, setMoodEmoji] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    if (open && entry) {
      setMode("view");
      setContent(entry.content);
      setMood(entry.mood);
      setMoodEmoji(entry.moodEmoji);
    }
  }, [open, entry]);

  if (!entry) return null;

  async function handleSaveEdit() {
    setBusy(true);
    try {
      await onSave(entry!.id, { content: content.trim(), mood, moodEmoji });
      setMode("view");
    } finally {
      setBusy(false);
    }
  }

  async function handleConfirmDelete() {
    setBusy(true);
    try {
      await onDelete(entry!.id);
      onOpenChange(false);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{formatJournalDateLong(entry.date)}</DialogTitle>
          {mode !== "confirm-delete" && (
            <DialogDescription>
              {entry.mood ? `${entry.moodEmoji ?? ""} ${entry.mood}`.trim() : "Belum ada mood dipilih"}
            </DialogDescription>
          )}
        </DialogHeader>

        {mode === "view" && (
          <div className="space-y-4">
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
              {entry.content.trim().length > 0 ? entry.content : "Belum ada catatan untuk hari ini."}
            </p>
            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => setMode("confirm-delete")} className="gap-1.5">
                <Trash2 className="h-4 w-4" /> Hapus
              </Button>
              <Button size="sm" onClick={() => setMode("edit")} className="gap-1.5">
                <Pencil className="h-4 w-4" /> Edit
              </Button>
            </DialogFooter>
          </div>
        )}

        {mode === "edit" && (
          <div className="space-y-4">
            <JournalMoodPicker
              value={mood}
              onChange={(label, emoji) => {
                setMood(label);
                setMoodEmoji(emoji);
              }}
            />
            <Textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="Ceritakan apa yang sedang Bunda rasakan..."
              rows={6}
              maxLength={4000}
            />
            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => setMode("view")} disabled={busy}>
                Batal
              </Button>
              <Button size="sm" onClick={handleSaveEdit} disabled={busy || content.trim().length === 0}>
                {busy ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
            </DialogFooter>
          </div>
        )}

        {mode === "confirm-delete" && (
          <div className="space-y-4">
            <p className="text-sm leading-relaxed text-foreground">
              Yakin ingin menghapus catatan tanggal {formatJournalDateLong(entry.date)}? Tindakan ini tidak bisa
              dibatalkan.
            </p>
            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => setMode("view")} disabled={busy}>
                Batal
              </Button>
              <Button variant="destructive" size="sm" onClick={handleConfirmDelete} disabled={busy}>
                {busy ? "Menghapus..." : "Ya, Hapus"}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
