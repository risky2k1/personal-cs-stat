import { AppHeader } from "@/components/layout/app-header";
import { MatchesTable } from "@/components/match/matches-table";
import { Card, CardContent } from "@/components/ui/card";
import { MOCK_MATCHES } from "@/lib/mock-data";

export default function MatchesPage() {
  const parsedCount = MOCK_MATCHES.filter((m) => m.status === "parsed").length;
  const avgAdr =
    MOCK_MATCHES.filter((m) => m.adr !== null).reduce((s, m) => s + (m.adr ?? 0), 0) /
    MOCK_MATCHES.filter((m) => m.adr !== null).length;
  const lastSyncAt = "2026-06-04T08:42:00Z";

  return (
    <>
      <AppHeader
        title="Matches"
        description="Lịch sử trận — sort, paginate (mock)"
        sync={{
          lastSyncAt,
          disabled: true,
        }}
      />
      <div className="space-y-4 p-4 md:p-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Trận đã parse" value={String(parsedCount)} />
          <StatCard label="ADR trung bình" value={avgAdr.toFixed(1)} />
          <StatCard label="Tổng trận" value={String(MOCK_MATCHES.length)} />
        </div>

        <MatchesTable />
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
