"use client";

import { useMemo, useState } from "react";
import {
  MOCK_ANALYSIS,
  MOCK_MARKERS,
  getHighlightMarkers,
  formatDuration,
  type MockMatch,
} from "@/lib/mock-data";
import { VideoPlaybackPanel } from "@/components/match/video-playback-panel";
import { MarkerIcon } from "@/components/match/marker-icon";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function MatchDetailView({ match }: { match: MockMatch }) {
  const [currentTime, setCurrentTime] = useState(0);
  const [filter, setFilter] = useState("all");

  const highlightMarkers = useMemo(
    () => getHighlightMarkers(MOCK_MARKERS),
    [],
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <VideoPlaybackPanel
        match={match}
        markers={MOCK_MARKERS}
        highlightMarkers={highlightMarkers}
        currentTime={currentTime}
        onSeek={setCurrentTime}
        filter={filter}
        onFilterChange={setFilter}
      />

      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center gap-4 text-2xl font-semibold">
              <span className="text-ct">{match.team_a_score}</span>
              <span className="text-base text-muted-foreground">:</span>
              <span className="text-t-side">{match.team_b_score}</span>
            </div>
            <p className="mt-2 text-center text-xs text-muted-foreground">
              {match.map_name.replace("de_", "")} ·{" "}
              {formatDuration(match.duration_seconds)}
            </p>
            {match.kills !== null ? (
              <p className="mt-2 text-center text-sm text-muted-foreground">
                {match.kills} / {match.deaths} / {match.assists}
                {match.adr !== null ? ` · ADR ${match.adr}` : ""}
              </p>
            ) : null}
          </CardContent>
        </Card>

        <Tabs defaultValue="events">
          <TabsList className="w-full">
            <TabsTrigger value="events" className="flex-1 cursor-pointer">
              Events
            </TabsTrigger>
            <TabsTrigger value="analysis" className="flex-1 cursor-pointer">
              Analysis
            </TabsTrigger>
          </TabsList>
          <TabsContent value="events">
            <Card>
              <CardContent className="p-0">
                <ScrollArea className="h-72">
                  <ul className="divide-y divide-border">
                    {MOCK_MARKERS.map((ev) => (
                      <li key={ev.id}>
                        <button
                          type="button"
                          onClick={() => setCurrentTime(ev.time_seconds)}
                          className="flex w-full cursor-pointer items-start gap-3 px-4 py-3 text-left transition-colors duration-200 hover:bg-muted/50"
                        >
                          <MarkerIcon icon={ev.icon} severity={ev.severity} />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium">{ev.label}</p>
                            <p className="text-xs text-muted-foreground">
                              R{ev.round_number} ·{" "}
                              {Math.floor(ev.time_seconds / 60)}:
                              {String(Math.floor(ev.time_seconds % 60)).padStart(
                                2,
                                "0",
                              )}
                            </p>
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="analysis" className="space-y-3">
            <AnalysisBlock
              title="Strengths"
              items={MOCK_ANALYSIS.strengths}
              variant="success"
            />
            <AnalysisBlock
              title="Weaknesses"
              items={MOCK_ANALYSIS.weaknesses}
              variant="destructive"
            />
            <AnalysisBlock
              title="Recommendations"
              items={MOCK_ANALYSIS.recommendations}
              variant="default"
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function AnalysisBlock({
  title,
  items,
  variant,
}: {
  title: string;
  items: { title: string; detail: string; evidence?: string[] }[];
  variant: "success" | "destructive" | "default";
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <CardTitle className="text-sm">{title}</CardTitle>
          <Badge
            variant="outline"
            className={
              variant === "success"
                ? "border-success/40 text-success"
                : variant === "destructive"
                  ? "border-destructive/40 text-destructive"
                  : ""
            }
          >
            {items.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item) => (
          <div key={item.title}>
            <p className="text-sm font-medium">{item.title}</p>
            <p className="text-xs text-muted-foreground">{item.detail}</p>
            {item.evidence ? (
              <ul className="mt-1 text-[10px] text-muted-foreground">
                {item.evidence.map((e) => (
                  <li key={e}>{e}</li>
                ))}
              </ul>
            ) : null}
            <Separator className="mt-3 last:hidden" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
