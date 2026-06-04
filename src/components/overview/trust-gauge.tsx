type TrustGaugeProps = {
  percent: number;
  label: string;
};

export function TrustGauge({ percent, label }: TrustGaugeProps) {
  const radius = 15.9155;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative size-36">
        <svg className="size-full -rotate-90" viewBox="0 0 36 36" aria-hidden>
          <circle
            cx="18"
            cy="18"
            r={radius}
            fill="none"
            className="stroke-muted"
            strokeWidth="3"
          />
          <circle
            cx="18"
            cy="18"
            r={radius}
            fill="none"
            className="stroke-success"
            strokeWidth="3"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-semibold tabular-nums">{percent}%</span>
          <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
            Trust
          </span>
        </div>
      </div>
      <span className="rounded-full border border-success/40 bg-success/10 px-3 py-0.5 text-xs font-medium text-success">
        {label}
      </span>
    </div>
  );
}
