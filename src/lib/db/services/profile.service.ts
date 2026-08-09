import { settingsService } from "./settings.service";

/** Key penyimpanan di store `settings` (key-value generik, lihat `settings.service.ts`). */
const SETTINGS_KEY = "profile";

export interface ProfileData {
  /** Nama panggilan Bunda, ditampilkan di Header & Settings. */
  name: string;
}

const DEFAULT_PROFILE: ProfileData = { name: "Bunda" };

/** Ambil huruf pertama tiap kata (maks. 2) untuk fallback avatar — mis. "Siti Aminah" -> "SA". */
function computeInitials(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "B";

  const words = trimmed.split(/\s+/).slice(0, 2);
  return words.map((word) => word.charAt(0).toUpperCase()).join("") || "B";
}

/**
 * Layer bisnis untuk profil pengguna. Disimpan lewat `settingsService` di
 * bawah key `"profile"` — bukan store baru — supaya otomatis ikut
 * tercakup dalam file backup (`BACKUPABLE_STORE_NAMES` sudah mencakup
 * store `settings`), sesuai Prompt 25 (Settings + Backup & Restore).
 */
export const profileService = {
  async get(): Promise<ProfileData> {
    return settingsService.get<ProfileData>(SETTINGS_KEY, DEFAULT_PROFILE);
  },

  /** Ganti nama panggilan. Melempar error biasa (bukan `DatabaseError`) bila nama kosong — cukup untuk validasi form sederhana. */
  async updateName(name: string): Promise<ProfileData> {
    const trimmed = name.trim();
    if (!trimmed) {
      throw new Error("Nama tidak boleh kosong.");
    }
    if (trimmed.length > 40) {
      throw new Error("Nama maksimal 40 karakter.");
    }

    const next: ProfileData = { name: trimmed };
    await settingsService.set(SETTINGS_KEY, next);
    return next;
  },

  initials: computeInitials,

  defaults(): ProfileData {
    return { ...DEFAULT_PROFILE };
  },
};
