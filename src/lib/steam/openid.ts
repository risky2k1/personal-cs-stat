import { randomUUID } from "node:crypto";
import type { SteamProfile } from "@/lib/steam/types";

const STEAM_OPENID_ENDPOINT = "https://steamcommunity.com/openid/login";
const STEAM_CLAIMED_ID_PREFIX = "https://steamcommunity.com/openid/id/";

function getOrigin(requestUrl: string) {
  const url = new URL(requestUrl);
  return `${url.protocol}//${url.host}`;
}

export function createSteamOpenIdState() {
  return randomUUID();
}

export function buildSteamLoginUrl(requestUrl: string, state: string) {
  const origin = getOrigin(requestUrl);
  const returnTo = new URL("/api/steam/callback", origin);
  returnTo.searchParams.set("state", state);

  const params = new URLSearchParams({
    "openid.ns": "http://specs.openid.net/auth/2.0",
    "openid.mode": "checkid_setup",
    "openid.return_to": returnTo.toString(),
    "openid.realm": origin,
    "openid.identity": "http://specs.openid.net/auth/2.0/identifier_select",
    "openid.claimed_id": "http://specs.openid.net/auth/2.0/identifier_select",
  });

  return `${STEAM_OPENID_ENDPOINT}?${params.toString()}`;
}

export async function verifySteamOpenIdResponse(requestUrl: string) {
  const url = new URL(requestUrl);
  const params = url.searchParams;

  const payload = new URLSearchParams();
  payload.set("openid.assoc_handle", params.get("openid.assoc_handle") ?? "");
  payload.set("openid.signed", params.get("openid.signed") ?? "");
  payload.set("openid.sig", params.get("openid.sig") ?? "");
  payload.set("openid.ns", "http://specs.openid.net/auth/2.0");
  payload.set("openid.mode", "check_authentication");

  const signedFields = (params.get("openid.signed") ?? "")
    .split(",")
    .filter(Boolean);

  for (const field of signedFields) {
    const value = params.get(`openid.${field}`);
    if (value !== null) {
      payload.set(`openid.${field}`, value);
    }
  }

  const response = await fetch(STEAM_OPENID_ENDPOINT, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
    },
    body: payload.toString(),
    cache: "no-store",
  });

  const body = await response.text();
  const claimedId = params.get("openid.claimed_id");

  if (!response.ok || !body.includes("is_valid:true") || !claimedId) {
    return null;
  }

  const steamId = claimedId.startsWith(STEAM_CLAIMED_ID_PREFIX)
    ? claimedId.slice(STEAM_CLAIMED_ID_PREFIX.length)
    : null;

  if (!steamId || !/^\d{17,25}$/.test(steamId)) {
    return null;
  }

  const profile: SteamProfile = {
    steamId,
    claimedId,
    displayName: `Steam ${steamId.slice(-6)}`,
    connectedAt: new Date().toISOString(),
  };

  return profile;
}
