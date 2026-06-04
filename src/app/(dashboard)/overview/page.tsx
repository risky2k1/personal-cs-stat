import { AppHeader } from "@/components/layout/app-header";
import { OverviewContent } from "@/components/overview/overview-content";
import { ProfileSidebar } from "@/components/overview/profile-sidebar";

export default function OverviewPage() {
  return (
    <>
      <AppHeader
        title="Overview"
        description="Tổng quan tài khoản — tham khảo CSRep player profile (mock)"
      />
      <div className="flex flex-col gap-4 p-4 lg:flex-row lg:p-6">
        <ProfileSidebar />
        <OverviewContent />
      </div>
    </>
  );
}
