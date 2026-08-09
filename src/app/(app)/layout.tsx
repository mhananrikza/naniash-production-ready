import { AppShell } from "@/components/layout/app-shell";

/**
 * Layout untuk seluruh rute di dalam shell aplikasi (Header + Sidebar/
 * BottomNav). Rute otentikasi (mis. login) hidup di luar grup ini,
 * lihat src/app/(auth).
 */
export default function AppRouteGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
