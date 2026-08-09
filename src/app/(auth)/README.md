# (auth)

Grup rute untuk halaman di luar shell aplikasi (tanpa Header/Sidebar/
BottomNav — lihat `layout.tsx` di folder ini).

## Sudah dibuat
- `splash/` — Splash Screen, auto-redirect ke `/welcome`
- `welcome/` — Welcome, perkenalan Naniash + CTA
- `onboarding/` — 3 slide (Selamat Datang · Pendamping Doa Harian · AI
  Sobat Bunda), swipeable, lalu masuk ke `/`

## Belum dibuat
- `login/` — magic link (Supabase Auth), sesuai roadmap Phase 1 langkah 4

Setelah `login/` dibangun, sambungkan alurnya: Splash → (cek sesi) →
Welcome/Onboarding untuk pengguna baru, atau langsung ke `/` untuk
pengguna yang sudah login. Logic pengecekan sesi ini belum ditambahkan
di `middleware.ts` — sengaja, supaya fondasi UI ini bisa direview dulu
sebelum digabung dengan auth.
