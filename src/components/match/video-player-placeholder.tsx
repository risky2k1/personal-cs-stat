"use client";

import { Play } from "lucide-react";
import { formatTime } from "@/lib/mock-data";

type VideoPlayerPlaceholderProps = {
  currentTime: number;
  durationSeconds: number;
  mapName: string;
  variant?: "full" | "highlight";
};

export function VideoPlayerPlaceholder({
  currentTime,
  durationSeconds,
  mapName,
  variant = "full",
}: VideoPlayerPlaceholderProps) {
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-border bg-[linear-gradient(145deg,oklch(0.12_0.02_260),oklch(0.18_0.03_260))] dark:bg-[linear-gradient(145deg,oklch(0.12_0.02_260),oklch(0.2_0.03_260))]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,oklch(0_0_0/0.45)_100%)]" />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center">
        <div className="flex size-14 cursor-pointer items-center justify-center rounded-full border border-border/80 bg-background/20 backdrop-blur-sm transition-colors duration-200 hover:bg-background/30">
          <Play className="size-6 text-foreground" aria-hidden />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground/90">
            {variant === "highlight"
              ? "Highlight reel playback"
              : "Demo playback"}
          </p>
          <p className="font-mono text-xs text-muted-foreground">
            {mapName} · {formatTime(currentTime)} / {formatTime(durationSeconds)}
          </p>
        </div>
      </div>
      <div className="absolute bottom-3 left-3 rounded bg-background/60 px-2 py-0.5 text-[10px] text-muted-foreground backdrop-blur-sm">
        MOCK · {variant === "highlight" ? "compiled kills" : ".dem stream"}
      </div>
    </div>
  );
}
