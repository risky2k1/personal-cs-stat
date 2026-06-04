import { NextResponse } from "next/server";
import type { SteamProfile, SteamSyncState } from "@/lib/steam/types";

const STEAM_PROFILE_COOKIE = "steam_profile";
const STEAM_SYNC_COOKIE = "steam_sync_state";
const STEAM_STATE_COOKIE = "steam_openid_state";
const THIRTY_DAYS_IN_SECONDS = 60 * 60 * 24 * 30;

type CookieReader = {
  get(name: string): { value: string } | undefined;
};

function encodeValue(value: unknown) {
  return Buffer.from(JSON.stringify(value), "utf8").toString("base64url");
}

function decodeValue<T>(value: string | undefined): T | null {
  if (!value) return null;

  try {
    return JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as T;
  } catch {
    return null;
  }
}

export function readSteamProfile(cookieStore: CookieReader) {
  return decodeValue<SteamProfile>(cookieStore.get(STEAM_PROFILE_COOKIE)?.value);
}

export function readSteamSyncState(cookieStore: CookieReader) {
  return decodeValue<SteamSyncState>(cookieStore.get(STEAM_SYNC_COOKIE)?.value);
}

export function readSteamOpenIdState(cookieStore: CookieReader) {
  return cookieStore.get(STEAM_STATE_COOKIE)?.value ?? null;
}

export function writeSteamProfile(response: NextResponse, profile: SteamProfile) {
  response.cookies.set(STEAM_PROFILE_COOKIE, encodeValue(profile), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: THIRTY_DAYS_IN_SECONDS,
  });
}

export function writeSteamSyncState(response: NextResponse, syncState: SteamSyncState) {
  response.cookies.set(STEAM_SYNC_COOKIE, encodeValue(syncState), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: THIRTY_DAYS_IN_SECONDS,
  });
}

export function writeSteamOpenIdState(response: NextResponse, state: string) {
  response.cookies.set(STEAM_STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 10,
  });
}

export function clearSteamSession(response: NextResponse) {
  response.cookies.delete(STEAM_PROFILE_COOKIE);
  response.cookies.delete(STEAM_SYNC_COOKIE);
  response.cookies.delete(STEAM_STATE_COOKIE);
}

export function clearSteamOpenIdState(response: NextResponse) {
  response.cookies.delete(STEAM_STATE_COOKIE);
}
