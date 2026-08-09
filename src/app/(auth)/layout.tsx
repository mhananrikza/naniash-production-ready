/**
 * Layout untuk rute di luar shell aplikasi — Splash, Welcome, Onboarding.
 * Sengaja tanpa Header/Sidebar/BottomNav; setiap halaman mengatur latar
 * & padding sendiri karena kebutuhan visualnya cukup berbeda satu sama
 * lain (Splash full-bleed gelap, Welcome/Onboarding terang + aurora).
 */
export default function AuthRouteGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="relative min-h-dvh overflow-x-hidden bg-background">{children}</div>;
}
