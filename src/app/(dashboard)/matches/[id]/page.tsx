import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { AppHeader } from "@/components/layout/app-header";
import { MatchDetailView } from "@/components/match/match-detail-view";
import { getMatchesForDashboard } from "@/lib/steam/mock-match-fetcher";
import { readSteamProfile, readSteamSyncState } from "@/lib/steam/session";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function MatchDetailPage({ params }: PageProps) {
  const { id } = await params;
  const cookieStore = await cookies();
  const match = getMatchesForDashboard(
    readSteamProfile(cookieStore),
    readSteamSyncState(cookieStore),
  ).find((item) => item.id === id);

  if (!match) {
    notFound();
  }

  return (
    <>
      <AppHeader
        title={match.map_name.replace("de_", "")}
        description={`${match.game_mode} · ${match.status}`}
      />
      <div className="p-4 md:p-6">
        <MatchDetailView match={match} />
      </div>
    </>
  );
}
