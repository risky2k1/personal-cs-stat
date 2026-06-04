export type MatchStatus =
  | "pending"
  | "fetching_demo"
  | "demo_downloaded"
  | "parsing"
  | "parsed"
  | "failed";

export type TimelineMarker = {
  id: string;
  marker_type: string;
  icon: "crosshair" | "skull" | "assist" | "bomb" | "defuse" | "star" | "fire";
  label: string;
  time_seconds: number;
  severity: "low" | "normal" | "high" | "highlight";
  round_number: number;
};

export type MockMatch = {
  id: string;
  map_name: string;
  game_mode: string;
  started_at: string;
  duration_seconds: number;
  team_a_score: number;
  team_b_score: number;
  status: MatchStatus;
  adr: number | null;
  kills: number | null;
  deaths: number | null;
  assists: number | null;
};

/** Mock duration for highlight reel (kills compilation) */
export const MOCK_HIGHLIGHT_DURATION_SECONDS = 272;

export const MOCK_MATCHES: MockMatch[] = [
  {
    id: "m1",
    map_name: "de_mirage",
    game_mode: "Competitive",
    started_at: "2026-06-03T20:14:00Z",
    duration_seconds: 2140,
    team_a_score: 13,
    team_b_score: 9,
    status: "parsed",
    adr: 86.4,
    kills: 24,
    deaths: 18,
    assists: 5,
  },
  {
    id: "m2",
    map_name: "de_inferno",
    game_mode: "Competitive",
    started_at: "2026-06-02T18:02:00Z",
    duration_seconds: 1980,
    team_a_score: 11,
    team_b_score: 13,
    status: "parsed",
    adr: 72.1,
    kills: 19,
    deaths: 21,
    assists: 8,
  },
  {
    id: "m3",
    map_name: "de_ancient",
    game_mode: "Premier",
    started_at: "2026-06-01T15:40:00Z",
    duration_seconds: 2560,
    team_a_score: 13,
    team_b_score: 11,
    status: "parsing",
    adr: null,
    kills: null,
    deaths: null,
    assists: null,
  },
  {
    id: "m4",
    map_name: "de_dust2",
    game_mode: "Competitive",
    started_at: "2026-05-31T12:20:00Z",
    duration_seconds: 2280,
    team_a_score: 16,
    team_b_score: 14,
    status: "parsed",
    adr: 91.2,
    kills: 28,
    deaths: 20,
    assists: 4,
  },
  {
    id: "m5",
    map_name: "de_nuke",
    game_mode: "Premier",
    started_at: "2026-05-30T21:05:00Z",
    duration_seconds: 2050,
    team_a_score: 10,
    team_b_score: 13,
    status: "parsed",
    adr: 64.8,
    kills: 16,
    deaths: 19,
    assists: 6,
  },
  {
    id: "m6",
    map_name: "de_overpass",
    game_mode: "Competitive",
    started_at: "2026-05-29T19:44:00Z",
    duration_seconds: 1890,
    team_a_score: 13,
    team_b_score: 7,
    status: "parsed",
    adr: 78.5,
    kills: 22,
    deaths: 14,
    assists: 9,
  },
  {
    id: "m7",
    map_name: "de_vertigo",
    game_mode: "Competitive",
    started_at: "2026-05-28T17:30:00Z",
    duration_seconds: 2410,
    team_a_score: 12,
    team_b_score: 12,
    status: "failed",
    adr: 55.0,
    kills: 17,
    deaths: 17,
    assists: 3,
  },
  {
    id: "m8",
    map_name: "de_anubis",
    game_mode: "Premier",
    started_at: "2026-05-27T14:10:00Z",
    duration_seconds: 2120,
    team_a_score: 13,
    team_b_score: 10,
    status: "parsed",
    adr: 83.7,
    kills: 21,
    deaths: 16,
    assists: 7,
  },
  {
    id: "m9",
    map_name: "de_train",
    game_mode: "Competitive",
    started_at: "2026-05-26T22:55:00Z",
    duration_seconds: 1760,
    team_a_score: 8,
    team_b_score: 13,
    status: "parsed",
    adr: 61.3,
    kills: 14,
    deaths: 22,
    assists: 5,
  },
  {
    id: "m10",
    map_name: "de_mirage",
    game_mode: "Competitive",
    started_at: "2026-05-25T11:18:00Z",
    duration_seconds: 1995,
    team_a_score: 13,
    team_b_score: 11,
    status: "parsed",
    adr: 74.9,
    kills: 20,
    deaths: 17,
    assists: 11,
  },
];

export function getHighlightMarkers(markers: TimelineMarker[]): TimelineMarker[] {
  return markers.filter((m) =>
    ["kill", "multi_kill", "clutch"].includes(m.marker_type),
  );
}

export const MOCK_MARKERS: TimelineMarker[] = [
  {
    id: "mk1",
    marker_type: "kill",
    icon: "crosshair",
    label: "Opening kill — AK-47",
    time_seconds: 42.5,
    severity: "normal",
    round_number: 1,
  },
  {
    id: "mk2",
    marker_type: "death",
    icon: "skull",
    label: "Traded on B site",
    time_seconds: 58.2,
    severity: "normal",
    round_number: 1,
  },
  {
    id: "mk3",
    marker_type: "bomb_plant",
    icon: "bomb",
    label: "Bomb planted A",
    time_seconds: 312.0,
    severity: "high",
    round_number: 5,
  },
  {
    id: "mk4",
    marker_type: "clutch",
    icon: "star",
    label: "1v2 clutch win",
    time_seconds: 328.4,
    severity: "highlight",
    round_number: 5,
  },
  {
    id: "mk5",
    marker_type: "multi_kill",
    icon: "fire",
    label: "3K burst",
    time_seconds: 890.1,
    severity: "highlight",
    round_number: 12,
  },
  {
    id: "mk6",
    marker_type: "death",
    icon: "skull",
    label: "Opening death mid",
    time_seconds: 1205.0,
    severity: "normal",
    round_number: 16,
  },
];

export const MOCK_ANALYSIS = {
  strengths: [
    {
      title: "Damage ổn định",
      detail: "ADR cao hơn trung bình 5 trận gần nhất.",
      evidence: ["ADR: 86.4", "Damage rounds: 15/24"],
    },
  ],
  weaknesses: [
    {
      title: "Chết mở round quá nhiều",
      detail: "5 opening deaths, chỉ 1 lần được trade.",
      evidence: ["Opening deaths: 5", "Traded deaths: 1"],
    },
  ],
  recommendations: [
    {
      title: "Giảm solo peek đầu round",
      detail: "Mirage A — chờ flash hoặc đi cùng người trade.",
    },
  ],
};

export function getMatchById(id: string): MockMatch | undefined {
  return MOCK_MATCHES.find((m) => m.id === id);
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}
