import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getSteamMatchFetcher } from "@/lib/steam/mock-match-fetcher";
import {
  readSteamProfile,
  writeSteamSyncState,
} from "@/lib/steam/session";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const profile = readSteamProfile(cookieStore);

  if (!profile) {
    return NextResponse.redirect(new URL("/settings?sync=steam-required", request.url));
  }

  try {
    const result = await getSteamMatchFetcher().syncLatestMatches(profile);
    const response = NextResponse.redirect(
      new URL(`/matches?sync=success&fetched=${result.fetchedCount}`, request.url),
    );

    writeSteamSyncState(response, result.syncState);
    return response;
  } catch {
    return NextResponse.redirect(new URL("/settings?sync=env-missing", request.url));
  }
}
