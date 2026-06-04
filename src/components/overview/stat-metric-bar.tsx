import { cn } from "@/lib/utils";

type StatMetricBarProps = {
  label: string;
  value: string;
  percentile: number;
};

export function StatMetricBar({ label, value, percentile }: StatMetricBarProps) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium tabular-nums">{value}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            "h-full rounded-full transition-[width] duration-300",
            percentile >= 70
              ? "bg-success"
              : percentile >= 45
                ? "bg-primary"
                : "bg-ct",
          )}
          style={{ width: `${Math.min(100, Math.max(0, percentile))}%` }}
        />
      </div>
    </div>
  );
}
