import type { SteamIntegrationConfig } from "@/lib/steam/types";

function hasValue(name: "STEAM_MATCH_TOKEN" | "STEAM_AUTH_CODE") {
  return Boolean(process.env[name]?.trim());
}

export function getSteamIntegrationConfig(): SteamIntegrationConfig {
  const matchTokenConfigured = hasValue("STEAM_MATCH_TOKEN");
  const authCodeConfigured = hasValue("STEAM_AUTH_CODE");

  return {
    matchTokenConfigured,
    authCodeConfigured,
    canSync: matchTokenConfigured && authCodeConfigured,
  };
}
