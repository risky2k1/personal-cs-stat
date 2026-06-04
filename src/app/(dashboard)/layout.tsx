import { AppSidebar } from "@/components/layout/app-sidebar";
import { MobileBottomNav, MobileNav } from "@/components/layout/mobile-nav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <div className="hidden md:flex">
        <AppSidebar />
      </div>
      <div className="flex min-h-0 flex-1 flex-col pb-16 md:pb-0">
        <div className="flex h-14 items-center border-b border-border px-4 md:hidden">
          <MobileNav />
        </div>
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
      <MobileBottomNav />
    </div>
  );
}
