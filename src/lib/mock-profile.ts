export type PerformanceMetric = {
  id: string;
  label: string;
  value: string;
  /** 0–100 for progress bar fill */
  percentile: number;
  trend?: "up" | "down" | "neutral";
};

export type AccountStatCard = {
  id: string;
  label: string;
  value: string;
  change?: string;
};

export type Anomaly = {
  id: string;
  label: string;
  severity: "low" | "medium" | "high";
  detail: string;
};

export const MOCK_PROFILE = {
  steamId: "76561198189125467",
  username: "riskyyy",
  avatarUrl: "",
  steamLevel: 22,
  status: "offline" as const,
  memberSince: "2015-04-01",
  playtimeHours: 3267,
  inventoryValueUsd: 173,
  premierRating: 12414,
  faceitLevel: 1201,
  trustPercent: 100,
  trustLabel: "Normal",
  repPositive: 42,
  repNegative: 3,
  platforms: [
    { id: "steam", label: "Steam", connected: true },
    { id: "cs2", label: "CS2", connected: true },
    { id: "faceit", label: "FACEIT", connected: true },
    { id: "leetify", label: "Leetify", connected: false },
  ],
  medals: [
    { id: "m1", label: "2024", color: "bg-amber-500/80" },
    { id: "m2", label: "2023", color: "bg-sky-500/80" },
    { id: "m3", label: "OW", color: "bg-violet-500/80" },
    { id: "m4", label: "10Y", color: "bg-emerald-500/80" },
    { id: "m5", label: "SVC", color: "bg-rose-500/80" },
    { id: "m6", label: "OP", color: "bg-orange-500/80" },
  ],
  matchesAnalyzed: 12,
  matchesRequired: 20,
};

export const MOCK_PERFORMANCE_LEFT: PerformanceMetric[] = [
  { id: "ttd", label: "Time to Damage", value: "536ms", percentile: 72 },
  { id: "xhair", label: "Crosshair Placement", value: "7.7°", percentile: 68 },
  { id: "kd", label: "K/D Ratio", value: "1.26", percentile: 81 },
  { id: "aim", label: "Aim Accuracy", value: "14.0%", percentile: 55 },
  { id: "wall", label: "Wallbang Kill %", value: "0.0%", percentile: 12 },
  { id: "hltv", label: "HLTV Rating 2.0", value: "1.28", percentile: 78 },
];

export const MOCK_PERFORMANCE_RIGHT: PerformanceMetric[] = [
  { id: "react", label: "Reaction Time", value: "335ms", percentile: 85 },
  { id: "preaim", label: "Preaim", value: "8.6°", percentile: 64 },
  { id: "adr", label: "ADR", value: "90.6", percentile: 88 },
  { id: "hs", label: "Head Accuracy", value: "13.9%", percentile: 52 },
  { id: "smoke", label: "Smoke Kill %", value: "4.0%", percentile: 48 },
  { id: "kast", label: "KAST", value: "78.5%", percentile: 76 },
];

export const MOCK_ACCOUNT_STATS: AccountStatCard[] = [
  { id: "age", label: "Account Age", value: "11y 2m", change: "+0%" },
  { id: "hours", label: "CS2 Hours", value: "3,267h", change: "+2.1%" },
  { id: "inv", label: "Inventory Value", value: "$173", change: "-1.2%" },
  { id: "level", label: "Steam Level", value: "Level 22", change: "+4.5%" },
  { id: "col", label: "Collectibles", value: "13", change: "+8.3%" },
];

export const MOCK_ANOMALIES: Anomaly[] = [
  {
    id: "sample",
    label: "Limited sample",
    severity: "medium",
    detail: "Fewer than 20 parsed matches for full trust model.",
  },
  {
    id: "rank",
    label: "Rank volatility",
    severity: "low",
    detail: "Premier rating swing > 800 in last 5 matches.",
  },
];
