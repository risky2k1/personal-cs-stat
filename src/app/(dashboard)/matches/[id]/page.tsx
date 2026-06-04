import { notFound } from "next/navigation";
import { AppHeader } from "@/components/layout/app-header";
import { MatchDetailView } from "@/components/match/match-detail-view";
import { getMatchById } from "@/lib/mock-data";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function MatchDetailPage({ params }: PageProps) {
  const { id } = await params;
  const match = getMatchById(id);

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
