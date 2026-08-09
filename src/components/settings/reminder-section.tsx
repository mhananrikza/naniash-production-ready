"use client";

import * as React from "react";
import { BellOff } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { useReminderSettings } from "@/hooks/use-reminder-settings";
import { notificationService } from "@/services/reminder-engine";

/**
 * Section "Reminder" (Prompt 25, bagian 4): reminder pagi (baca doa),
 * reminder malam (journal), plus jam masing-masing. Memakai
 * `useReminderSettings` -> `reminderSettingsService` (store `settings`,
 * key `"reminderEngine"`) yang sudah ada dari Reminder Engine — di sini
 * hanya menambahkan UI-nya.
 */
export function ReminderSection() {
  const { settings, hydrated, saving, error, update } = useReminderSettings();
  const [permission, setPermission] = React.useState<ReturnType<typeof notificationService.getPermission>>("default");

  React.useEffect(() => {
    setPermission(notificationService.getPermission());
  }, []);

  async function handleToggle(key: "doaReminderEnabled" | "journalReminderEnabled", value: boolean) {
    if (value && notificationService.isSupported() && notificationService.getPermission() === "default") {
      const result = await notificationService.requestPermission();
      setPermission(result);
    }
    await update({ [key]: value });
  }

  return (
    <section id="reminder" aria-labelledby="reminder-heading" className="scroll-mt-24">
      <Card>
        <CardHeader>
          <CardTitle id="reminder-heading">Reminder</CardTitle>
          <CardDescription>Pengingat harian untuk doa pagi dan menulis journal malam.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {!hydrated ? (
            <div className="space-y-4">
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>
          ) : (
            <>
              {permission === "denied" ? (
                <p className="flex items-center gap-1.5 rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground">
                  <BellOff className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  Notifikasi diblokir di browser ini. Reminder tetap tersimpan, tapi tidak akan
                  menampilkan pemberitahuan sampai izin diaktifkan lagi lewat pengaturan browser.
                </p>
              ) : null}

              {/* Reminder pagi */}
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <Label htmlFor="reminder-pagi">Reminder pagi</Label>
                  <p className="text-xs text-muted-foreground">
                    Ajakan membaca doa, jam {settings.morningTime}.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="time"
                    aria-label="Jam reminder pagi"
                    value={settings.morningTime}
                    disabled={saving}
                    onChange={(event) => update({ morningTime: event.target.value })}
                    className="h-9 rounded-lg border border-input bg-background px-2 text-sm text-foreground shadow-sm disabled:opacity-50"
                  />
                  <Switch
                    id="reminder-pagi"
                    checked={settings.doaReminderEnabled}
                    onCheckedChange={(checked) => handleToggle("doaReminderEnabled", checked)}
                    disabled={saving}
                    aria-label="Aktifkan reminder pagi"
                  />
                </div>
              </div>

              <Separator />

              {/* Reminder malam / journal */}
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <Label htmlFor="reminder-journal">Reminder journal</Label>
                  <p className="text-xs text-muted-foreground">
                    Ajakan menulis journal malam, jam {settings.eveningTime}.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="time"
                    aria-label="Jam reminder journal"
                    value={settings.eveningTime}
                    disabled={saving}
                    onChange={(event) => update({ eveningTime: event.target.value })}
                    className="h-9 rounded-lg border border-input bg-background px-2 text-sm text-foreground shadow-sm disabled:opacity-50"
                  />
                  <Switch
                    id="reminder-journal"
                    checked={settings.journalReminderEnabled}
                    onCheckedChange={(checked) => handleToggle("journalReminderEnabled", checked)}
                    disabled={saving}
                    aria-label="Aktifkan reminder journal"
                  />
                </div>
              </div>

              {error ? <p className="text-xs text-destructive">{error}</p> : null}
            </>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
