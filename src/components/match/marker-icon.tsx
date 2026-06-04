import {
  Bomb,
  Crosshair,
  Flame,
  Skull,
  Star,
  Users,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import type { TimelineMarker } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<TimelineMarker["icon"], LucideIcon> = {
  crosshair: Crosshair,
  skull: Skull,
  assist: Users,
  bomb: Bomb,
  defuse: Wrench,
  star: Star,
  fire: Flame,
};

const SEVERITY_CLASS: Record<TimelineMarker["severity"], string> = {
  low: "text-muted-foreground",
  normal: "text-foreground",
  high: "text-ct",
  highlight: "text-highlight",
};

export function MarkerIcon({
  icon,
  severity = "normal",
  className,
}: {
  icon: TimelineMarker["icon"];
  severity?: TimelineMarker["severity"];
  className?: string;
}) {
  const Icon = ICON_MAP[icon];
  return (
    <Icon
      className={cn("size-3.5", SEVERITY_CLASS[severity], className)}
      aria-hidden
    />
  );
}
