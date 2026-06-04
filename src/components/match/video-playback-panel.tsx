"use client";

import { useCallback, useState } from "react";
import { Film, Loader2, Play, Sparkles } from "lucide-react";
import {
  MOCK_HIGHLIGHT_DURATION_SECONDS,
  formatDuration,
  formatTime,
  type MockMatch,
} from "@/lib/mock-data";
import { VideoPlayerPlaceholder } from "@/components/match/video-player-placeholder";
import {
  TimelineBar,
  TimelineFilters,
} from "@/components/match/timeline-bar";
import type { TimelineMarker } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export type VideoViewMode = "idle" | "loading" | "playback" | "highlight";

type VideoPlaybackPanelProps = {
  match: MockMatch;
  markers: TimelineMarker[];
  highlightMarkers: TimelineMarker[];
  currentTime: number;
  onSeek: (time: number) => void;
  filter: string;
  onFilterChange: (filter: string) => void;
};

const MOCK_LOAD_MS = 2200;

export function VideoPlaybackPanel({
  match,
  markers,
  highlightMarkers,
  currentTime,
  onSeek,
  filter,
  onFilterChange,
}: VideoPlaybackPanelProps) {
  const [viewMode, setViewMode] = useState<VideoViewMode>("idle");
  const [loadProgress, setLoadProgress] = useState(0);
  const [pendingMode, setPendingMode] = useState<"playback" | "highlight" | null>(
    null,
  );

  const startLoad = useCallback((target: "playback" | "highlight") => {
    setViewMode("loading");
    setPendingMode(target);
    setLoadProgress(0);

    const steps = [15, 40, 68, 90, 100];
    let i = 0;
    const interval = setInterval(() => {
      if (i < steps.length) {
        setLoadProgress(steps[i]!);
        i += 1;
      }
    }, MOCK_LOAD_MS / steps.length);

    setTimeout(() => {
      clearInterval(interval);
      setLoadProgress(100);
      setViewMode(target);
      setPendingMode(null);
      onSeek(0);
    }, MOCK_LOAD_MS);
  }, [onSeek]);

  const activeMarkers =
    viewMode === "highlight" ? highlightMarkers : markers;
  const duration =
    viewMode === "highlight"
      ? MOCK_HIGHLIGHT_DURATION_SECONDS
      : match.duration_seconds;

  if (viewMode === "idle") {
    return (
      <Card className="overflow-hidden">
        <div className="relative flex aspect-video flex-col items-center justify-center gap-4 border-b border-border bg-muted/30 p-6 text-center">
          <div className="flex size-14 items-center justify-center rounded-full border border-border bg-card">
            <Film className="size-7 text-muted-foreground" aria-hidden />
          </div>
          <div className="max-w-md space-y-1">
            <p className="text-sm font-medium">Chưa có video</p>
            <p className="text-xs text-muted-foreground">
              Demo chưa được tải. Chọn một tuỳ chọn bên dưới để bắt đầu (mock —
              phase sau sẽ tải .dem thật hoặc render highlight).
            </p>
          </div>
        </div>
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row">
          <Button
            className="flex-1 cursor-pointer gap-2"
            onClick={() => startLoad("playback")}
          >
            <Play className="size-4" />
            View playback
          </Button>
          <Button
            variant="secondary"
            className="flex-1 cursor-pointer gap-2"
            onClick={() => startLoad("highlight")}
          >
            <Sparkles className="size-4" />
            Generate highlight
          </Button>
        </CardContent>
        <CardContent className="border-t border-border pt-0 pb-4">
          <p className="text-xs text-muted-foreground">
            <strong className="text-foreground">View playback</strong> — tải demo
            đầy đủ (~{formatDuration(match.duration_seconds)}).{" "}
            <strong className="text-foreground">Generate highlight</strong> — clip
            ngắn (~{formatDuration(MOCK_HIGHLIGHT_DURATION_SECONDS)}) ghép các
            tình huống kill của bạn.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (viewMode === "loading") {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">
            {pendingMode === "highlight"
              ? "Đang tạo highlight…"
              : "Đang tải demo…"}
          </CardTitle>
          <CardDescription>
            {pendingMode === "highlight"
              ? "Ghép các pha kill — mock worker"
              : "Tải file .dem từ storage — mock"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pb-6">
          <Progress value={loadProgress} className="h-2" />
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            {loadProgress}%
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {viewMode === "highlight" ? (
            <span className="rounded-md border border-highlight/40 bg-highlight/10 px-2 py-0.5 text-xs font-medium text-highlight">
              Highlight reel
            </span>
          ) : (
            <span className="rounded-md border border-primary/30 bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              Full demo
            </span>
          )}
          <span className="text-xs text-muted-foreground">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>
        <div className="flex gap-2">
          {viewMode === "playback" ? (
            <Button
              variant="outline"
              size="sm"
              className="cursor-pointer gap-1.5"
              onClick={() => startLoad("highlight")}
            >
              <Sparkles className="size-3.5" />
              Generate highlight
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="cursor-pointer gap-1.5"
              onClick={() => startLoad("playback")}
            >
              <Play className="size-3.5" />
              View full demo
            </Button>
          )}
        </div>
      </div>

      <VideoPlayerPlaceholder
        currentTime={currentTime}
        durationSeconds={duration}
        mapName={match.map_name}
        variant={viewMode === "highlight" ? "highlight" : "full"}
      />

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Timeline</CardTitle>
          {viewMode === "highlight" ? (
            <CardDescription>
              Chỉ marker kill / multi-kill / clutch ({activeMarkers.length} sự
              kiện)
            </CardDescription>
          ) : null}
        </CardHeader>
        <CardContent className="space-y-3">
          <TimelineFilters value={filter} onChange={onFilterChange} />
          <TimelineBar
            markers={activeMarkers}
            durationSeconds={duration}
            currentTime={currentTime}
            onSeek={onSeek}
            filter={filter}
          />
        </CardContent>
      </Card>
    </div>
  );
}
