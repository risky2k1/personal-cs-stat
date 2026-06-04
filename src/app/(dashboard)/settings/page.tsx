import { AppHeader } from "@/components/layout/app-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <>
      <AppHeader
        title="Settings"
        description="Steam connect & match tracking — placeholder"
      />
      <div className="p-4 md:p-6">
        <Card className="max-w-lg">
          <CardHeader>
            <CardTitle>Match tracking</CardTitle>
            <CardDescription>
              Form nhập Match Token và Authentication Code sẽ nằm ở đây (phase
              tiếp theo).
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Prototype hiện chỉ mock UI. Auth code không được log hoặc hiển thị sau
            khi lưu.
          </CardContent>
        </Card>
      </div>
    </>
  );
}
