import type { ComponentType } from "react";
import Link from "next/link";
import { CheckCircle2, ExternalLink, Link2, RefreshCw, ShieldAlert, Unplug } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type {
  SteamIntegrationConfig,
  SteamProfile,
  SteamSyncState,
} from "@/lib/steam/types";

type MessageTone = "default" | "success" | "warning" | "destructive";

type SteamSettingsPanelProps = {
  config: SteamIntegrationConfig;
  profile: SteamProfile | null;
  syncState: SteamSyncState | null;
  message: {
    tone: MessageTone;
    text: string;
  } | null;
};

function toneClass(tone: MessageTone) {
  if (tone === "success") {
    return "border-success/30 bg-success/10 text-success";
  }

  if (tone === "warning") {
    return "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300";
  }

  if (tone === "destructive") {
    return "border-destructive/30 bg-destructive/10 text-destructive";
  }

  return "border-border bg-muted/30 text-foreground";
}

function formatDateTime(iso: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function SteamSettingsPanel({
  config,
  profile,
  syncState,
  message,
}: SteamSettingsPanelProps) {
  return (
    <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
      <Card>
        <CardHeader>
          <CardTitle>Steam connect</CardTitle>
          <CardDescription>
            Đăng nhập bằng Steam OpenID, sau đó sync match bằng
            <code className="mx-1 rounded bg-muted px-1.5 py-0.5 text-xs">
              STEAM_MATCH_TOKEN
            </code>
            và
            <code className="mx-1 rounded bg-muted px-1.5 py-0.5 text-xs">
              STEAM_AUTH_CODE
            </code>
            từ server env.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {message ? (
            <div className={`rounded-lg border px-3 py-3 text-sm ${toneClass(message.tone)}`}>
              {message.text}
            </div>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-2">
            <StatusTile
              label="Steam session"
              value={profile ? "Connected" : "Not connected"}
              detail={
                profile
                  ? `Steam ID ${profile.steamId.slice(-8)}`
                  : "Chưa xác thực qua Steam"
              }
              ok={Boolean(profile)}
            />
            <StatusTile
              label="Server credentials"
              value={config.canSync ? "Ready" : "Missing"}
              detail={
                config.canSync
                  ? "Token và auth code đã có trong env"
                  : "Thiếu STEAM_MATCH_TOKEN hoặc STEAM_AUTH_CODE"
              }
              ok={config.canSync}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {!profile ? (
              <a
                href="/api/steam/connect"
                className={buttonVariants({ className: "cursor-pointer" })}
              >
                <Link2 />
                Connect Steam
              </a>
            ) : (
              <>
                <form action="/api/match-tracking/sync-now" method="post">
                  <Button className="cursor-pointer" disabled={!config.canSync}>
                    <RefreshCw />
                    Fetch match data
                  </Button>
                </form>
                <form action="/api/steam/disconnect" method="post">
                  <Button variant="outline" className="cursor-pointer">
                    <Unplug />
                    Disconnect
                  </Button>
                </form>
              </>
            )}

            <Link
              href="/matches"
              className={buttonVariants({
                variant: "outline",
                className: "cursor-pointer",
              })}
            >
              <ExternalLink />
              Open matches
            </Link>
          </div>

          <div className="rounded-lg border border-border bg-muted/20 p-3 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">Security note</p>
            <p className="mt-1">
              Auth code chỉ được đọc ở server. UI không render raw
              <code className="mx-1 rounded bg-background px-1.5 py-0.5 text-xs">
                STEAM_AUTH_CODE
              </code>
              ra browser.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tracking status</CardTitle>
          <CardDescription>
            Adapter hiện tại là mock-first: connect Steam thật, fetch match mock theo env.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <InfoRow
            icon={CheckCircle2}
            label="Connected account"
            value={profile ? profile.displayName : "None"}
          />
          <InfoRow
            icon={ShieldAlert}
            label="Last sync"
            value={syncState ? formatDateTime(syncState.lastSyncAt) : "Chưa sync"}
          />
          <InfoRow
            icon={RefreshCw}
            label="Fetched matches"
            value={syncState ? String(syncState.fetchedCount) : "0"}
          />
          <div className="rounded-lg border border-dashed border-border px-3 py-3 text-xs text-muted-foreground">
            Bước tiếp theo khi schema/UI ổn định: thay mock fetcher bằng Steam/Valve adapter thật, rồi enqueue
            `download-demo` và `parse-demo`.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatusTile({
  label,
  value,
  detail,
  ok,
}: {
  label: string;
  value: string;
  detail: string;
  ok: boolean;
}) {
  return (
    <div className="rounded-lg border border-border bg-muted/20 p-3">
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className={`mt-1 text-base font-semibold ${ok ? "text-success" : ""}`}>
        {value}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/20 px-3 py-3">
      <div className="mt-0.5 rounded-md bg-background p-2">
        <Icon className="size-4" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}
