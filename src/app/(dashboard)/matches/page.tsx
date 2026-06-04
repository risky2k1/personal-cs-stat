import { cookies } from "next/headers";
import Link from "next/link";
import { AppHeader } from "@/components/layout/app-header";
import { MatchesTable } from "@/components/match/matches-table";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { readSteamProfile, readSteamSyncState } from "@/lib/steam/session";
import { getMatchesForDashboard } from "@/lib/steam/mock-match-fetcher";

type MatchesPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function getSyncMessage(sync: string | undefined, fetched: string | undefined) {
  if (sync !== "success") {
    return null;
  }

  return `Steam sync hoàn tất. Đã nạp ${fetched ?? "0"} match mock từ cấu hình server.`;
}

export default async function MatchesPage({ searchParams }: MatchesPageProps) {
  const params = await searchParams;
  const cookieStore = await cookies();
  const profile = readSteamProfile(cookieStore);
  const syncState = readSteamSyncState(cookieStore);
  const matches = getMatchesForDashboard(profile, syncState);
  const parsedCount = matches.filter((m) => m.status === "parsed").length;
  const avgAdr =
    matches.filter((m) => m.adr !== null).reduce((s, m) => s + (m.adr ?? 0), 0) /
    matches.filter((m) => m.adr !== null).length;
  const syncMessage = getSyncMessage(
    typeof params.sync === "string" ? params.sync : undefined,
    typeof params.fetched === "string" ? params.fetched : undefined,
  );

  return (
    <>
      <AppHeader
        title="Matches"
        description="Lịch sử trận — gồm dữ liệu mock mặc định và match sync từ Steam env"
        actions={
          <Link
            href="/settings"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            Settings
          </Link>
        }
      />
      <div className="space-y-4 p-4 md:p-6">
        {syncMessage ? (
          <div className="rounded-lg border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">
            {syncMessage}
          </div>
        ) : null}
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Trận đã parse" value={String(parsedCount)} />
          <StatCard label="ADR trung bình" value={avgAdr.toFixed(1)} />
          <StatCard label="Tổng trận" value={String(matches.length)} />
        </div>

        <MatchesTable matches={matches} />
      </div>
    </>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-2xl font-semibold tracking-tight">{value}</p>
      </CardContent>
    </Card>
  );
}
