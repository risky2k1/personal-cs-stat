import {
  MOCK_MATCHES,
  type MockMatch,
  type MatchStatus,
} from "@/lib/mock-data";
import { getSteamIntegrationConfig } from "@/lib/steam/config";
import type { SteamProfile, SteamSyncState } from "@/lib/steam/types";

export type SteamSyncResult = {
  fetchedCount: number;
  syncedMatches: MockMatch[];
  syncState: SteamSyncState;
};

export interface SteamMatchFetcher {
  syncLatestMatches(profile: SteamProfile): Promise<SteamSyncResult>;
  getSyncedMatches(profile: SteamProfile, syncState: SteamSyncState | null): MockMatch[];
}

const MAP_POOL = [
  "de_mirage",
  "de_inferno",
  "de_ancient",
  "de_nuke",
  "de_anubis",
  "de_dust2",
] as const;

const MODE_POOL = ["Competitive", "Premier"] as const;
const STATUS_POOL: MatchStatus[] = ["parsed", "parsed", "parsed", "parsing"];

function hashText(value: string) {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return Math.abs(hash >>> 0);
}

function buildSyncedMatch(profile: SteamProfile, seed: number, index: number): MockMatch {
  const startedAt = new Date(Date.UTC(2026, 5, 4, 12, 0, 0));
  startedAt.setUTCDate(startedAt.getUTCDate() - index);
  startedAt.setUTCMinutes(startedAt.getUTCMinutes() - (seed % 43));

  const kills = 17 + ((seed + index * 7) % 14);
  const deaths = 12 + ((seed + index * 5) % 11);
  const assists = 3 + ((seed + index * 3) % 9);
  const teamAScore = 8 + ((seed + index) % 6);
  const teamBScore = 7 + ((seed + index * 2) % 7);

  return {
    id: `steam-${profile.steamId.slice(-6)}-${index + 1}`,
    map_name: MAP_POOL[(seed + index) % MAP_POOL.length],
    game_mode: MODE_POOL[(seed + index) % MODE_POOL.length],
    started_at: startedAt.toISOString(),
    duration_seconds: 1800 + ((seed + index * 11) % 900),
    team_a_score: Math.max(teamAScore, teamBScore + 1),
    team_b_score: Math.min(teamAScore, teamBScore),
    status: STATUS_POOL[(seed + index) % STATUS_POOL.length],
    adr: Number((70 + ((seed + index * 13) % 35) + 0.4).toFixed(1)),
    kills,
    deaths,
    assists,
  };
}

function getSeed(profile: SteamProfile) {
  return hashText(
    [
      profile.steamId,
      process.env.STEAM_MATCH_TOKEN ?? "",
      process.env.STEAM_AUTH_CODE ?? "",
    ].join(":"),
  );
}

class EnvSteamMatchFetcher implements SteamMatchFetcher {
  async syncLatestMatches(profile: SteamProfile): Promise<SteamSyncResult> {
    const config = getSteamIntegrationConfig();

    if (!config.canSync) {
      throw new Error(
        "Missing STEAM_MATCH_TOKEN or STEAM_AUTH_CODE in server environment.",
      );
    }

    const seed = getSeed(profile);
    const syncedMatches = Array.from({ length: 3 }, (_, index) =>
      buildSyncedMatch(profile, seed, index),
    );

    return {
      fetchedCount: syncedMatches.length,
      syncedMatches,
      syncState: {
        lastSyncAt: new Date().toISOString(),
        fetchedCount: syncedMatches.length,
        source: "env_mock",
      },
    };
  }

  getSyncedMatches(profile: SteamProfile, syncState: SteamSyncState | null) {
    if (!syncState) {
      return [];
    }

    const config = getSteamIntegrationConfig();
    if (!config.canSync) {
      return [];
    }

    const seed = getSeed(profile);
    return Array.from({ length: 3 }, (_, index) =>
      buildSyncedMatch(profile, seed, index),
    );
  }
}

const fetcher = new EnvSteamMatchFetcher();

export function getSteamMatchFetcher() {
  return fetcher;
}

export function getMatchesForDashboard(
  profile: SteamProfile | null,
  syncState: SteamSyncState | null,
) {
  if (!profile) {
    return MOCK_MATCHES;
  }

  return [
    ...getSteamMatchFetcher().getSyncedMatches(profile, syncState),
    ...MOCK_MATCHES,
  ];
}
