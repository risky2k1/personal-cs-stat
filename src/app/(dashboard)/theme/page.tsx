import { AppHeader } from "@/components/layout/app-header";
import { ThemeShowcase } from "@/components/theme/theme-showcase";

export default function ThemePage() {
  return (
    <>
      <AppHeader
        title="Theme"
        description="Design tokens · tactical dark · shadcn/ui"
      />
      <div className="p-4 md:p-6">
        <ThemeShowcase />
      </div>
    </>
  );
}
