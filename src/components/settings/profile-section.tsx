"use client";

import * as React from "react";
import { Check, Pencil, X } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useProfile } from "@/hooks/use-profile";

/**
 * Section "Profil" (Prompt 25, bagian 1): nama pengguna, avatar/initial
 * dari inisial nama, dan form edit nama. Disimpan lewat `profileService`
 * (store `settings`, key `"profile"`) — otomatis ikut ke file backup
 * karena bagian dari store `settings`.
 */
export function ProfileSection() {
  const { profile, hydrated, saving, error, updateName, initials } = useProfile();

  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState(profile.name);

  React.useEffect(() => {
    if (!editing) setDraft(profile.name);
  }, [profile.name, editing]);

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();
    try {
      await updateName(draft);
      setEditing(false);
    } catch {
      // Pesan error sudah ditampilkan lewat `error` dari hook.
    }
  }

  return (
    <section id="profil" aria-labelledby="profil-heading" className="scroll-mt-24">
      <Card>
        <CardHeader>
          <CardTitle id="profil-heading">Profil</CardTitle>
          <CardDescription>Nama panggilan Bunda, ditampilkan di seluruh aplikasi.</CardDescription>
        </CardHeader>
        <CardContent>
          {!hydrated ? (
            <div className="flex items-center gap-4">
              <Skeleton className="h-14 w-14 shrink-0 rounded-full" />
              <Skeleton className="h-5 w-32" />
            </div>
          ) : editing ? (
            <form onSubmit={handleSave} className="space-y-3">
              <div className="flex items-center gap-4">
                <Avatar className="h-14 w-14 shrink-0">
                  <AvatarFallback className="text-lg">{initials}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1.5">
                  <Label htmlFor="profile-name">Nama panggilan</Label>
                  <Input
                    id="profile-name"
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    placeholder="Nama Bunda"
                    maxLength={40}
                    autoFocus
                  />
                </div>
              </div>

              {error ? <p className="text-xs text-destructive">{error}</p> : null}

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditing(false)}
                  disabled={saving}
                >
                  <X /> Batal
                </Button>
                <Button type="submit" size="sm" disabled={saving}>
                  <Check /> {saving ? "Menyimpan..." : "Simpan"}
                </Button>
              </div>
            </form>
          ) : (
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-14 w-14 shrink-0">
                  <AvatarFallback className="text-lg">{initials}</AvatarFallback>
                </Avatar>
                <p className="font-display text-base font-medium text-foreground">{profile.name}</p>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={() => setEditing(true)}>
                <Pencil /> Edit nama
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
