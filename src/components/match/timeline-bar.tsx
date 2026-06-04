"use client";

import { useMemo } from "react";
import type { TimelineMarker } from "@/lib/mock-data";
import { formatTime } from "@/lib/mock-data";
import { MarkerIcon } from "@/components/match/marker-icon";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type TimelineBarProps = {
  markers: TimelineMarker[];
  durationSeconds: number;
  currentTime: number;
  onSeek: (time: number) => void;
  filter?: string;
};

export function TimelineBar({
  markers,
  durationSeconds,
  currentTime,
  onSeek,
  filter = "all",
}: TimelineBarProps) {
  const filtered = useMemo(() => {
    if (filter === "all") return markers;
    if (filter === "kills")
      return markers.filter((m) => m.marker_type === "kill");
    if (filter === "deaths")
      return markers.filter((m) => m.marker_type === "death");
    if (filter === "highlights")
      return markers.filter((m) => m.severity === "highlight");
    if (filter === "bomb")
      return markers.filter((m) =>
        ["bomb_plant", "bomb_defuse"].includes(m.marker_type),
      );
    if (filter === "clutches")
      return markers.filter((m) => m.marker_type === "clutch");
    return markers;
  }, [markers, filter]);

  const progress = durationSeconds > 0 ? (currentTime / durationSeconds) * 100 : 0;

  return (
    <div className="space-y-2">
      <div className="relative h-10 rounded-md bg-muted/60">
        <div
          className="absolute inset-y-0 left-0 rounded-md bg-primary/25 transition-[width] duration-150"
          style={{ width: `${progress}%` }}
        />
        {filtered.map((marker) => {
          const left = (marker.time_seconds / durationSeconds) * 100;
          return (
            <Tooltip key={marker.id}>
              <TooltipTrigger
                render={
                  <button
                    type="button"
                    className={cn(
                      "absolute top-1/2 z-10 flex size-7 -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-border bg-card shadow-sm transition-colors duration-200 hover:border-primary hover:ring-2 hover:ring-ring/40",
                      marker.severity === "highlight" &&
                        "border-highlight/50 bg-highlight/10",
                    )}
                    style={{ left: `${left}%` }}
                    onClick={() => onSeek(marker.time_seconds)}
                    aria-label={marker.label}
                  >
                    <MarkerIcon icon={marker.icon} severity={marker.severity} />
                  </button>
                }
              />
              <TooltipContent side="top" className="max-w-xs">
                <p className="font-medium">
                  Round {marker.round_number} · {formatTime(marker.time_seconds)}
                </p>
                <p className="text-muted-foreground">{marker.label}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
      <div className="flex justify-between font-mono text-xs text-muted-foreground">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(durationSeconds)}</span>
      </div>
    </div>
  );
}

export function TimelineFilters({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const filters = [
    { id: "all", label: "All" },
    { id: "kills", label: "Kills" },
    { id: "deaths", label: "Deaths" },
    { id: "highlights", label: "Highlights" },
    { id: "bomb", label: "Bomb" },
    { id: "clutches", label: "Clutches" },
  ];

  return (
    <div className="flex flex-wrap gap-1">
      {filters.map((f) => (
        <button
          key={f.id}
          type="button"
          onClick={() => onChange(f.id)}
          className={cn(
            "cursor-pointer rounded-md px-2.5 py-1 text-xs font-medium transition-colors duration-200",
            value === f.id
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:text-foreground",
          )}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}
