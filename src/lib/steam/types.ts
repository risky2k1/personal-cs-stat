export type SteamProfile = {
  steamId: string;
  displayName: string;
  claimedId: string;
  connectedAt: string;
};

export type SteamSyncState = {
  lastSyncAt: string;
  fetchedCount: number;
  source: "env_mock";
};

export type SteamIntegrationConfig = {
  matchTokenConfigured: boolean;
  authCodeConfigured: boolean;
  canSync: boolean;
};
