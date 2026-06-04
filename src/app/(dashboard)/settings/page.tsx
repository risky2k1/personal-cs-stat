import { cookies } from "next/headers";
import { AppHeader } from "@/components/layout/app-header";
import { SteamSettingsPanel } from "@/components/steam/steam-settings-panel";
import { getSteamIntegrationConfig } from "@/lib/steam/config";
import { readSteamProfile, readSteamSyncState } from "@/lib/steam/session";

type SettingsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function getSettingsMessage(
  steamState: string | undefined,
  syncState: string | undefined,
) {
  if (steamState === "connected") {
    return {
      tone: "success" as const,
      text: "Steam account connected. Bạn có thể fetch match data bằng credentials trong server env.",
    };
  }

  if (steamState === "disconnected") {
    return {
      tone: "default" as const,
      text: "Steam session đã được xoá khỏi browser hiện tại.",
    };
  }

  if (steamState === "state-mismatch" || steamState === "connect-failed") {
    return {
      tone: "destructive" as const,
      text: "Steam login không hoàn tất được. Thử connect lại một lần nữa.",
    };
  }

  if (syncState === "steam-required") {
    return {
      tone: "warning" as const,
      text: "Cần connect Steam trước khi chạy sync match data.",
    };
  }

  if (syncState === "env-missing") {
    return {
      tone: "warning" as const,
      text: "Thiếu STEAM_MATCH_TOKEN hoặc STEAM_AUTH_CODE trong server env.",
    };
  }

  return null;
}

export default async function SettingsPage({ searchParams }: SettingsPageProps) {
  const params = await searchParams;
  const cookieStore = await cookies();
  const config = getSteamIntegrationConfig();
  const profile = readSteamProfile(cookieStore);
  const syncState = readSteamSyncState(cookieStore);
  const message = getSettingsMessage(
    typeof params.steam === "string" ? params.steam : undefined,
    typeof params.sync === "string" ? params.sync : undefined,
  );

  return (
    <>
      <AppHeader
        title="Settings"
        description="Steam connect + env-based match tracking"
      />
      <div className="space-y-4 p-4 md:p-6">
        <SteamSettingsPanel
          config={config}
          profile={profile}
          syncState={syncState}
          message={message}
        />
      </div>
    </>
  );
}
