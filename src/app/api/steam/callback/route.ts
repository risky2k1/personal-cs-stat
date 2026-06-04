import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { verifySteamOpenIdResponse } from "@/lib/steam/openid";
import {
  clearSteamOpenIdState,
  readSteamOpenIdState,
  writeSteamProfile,
} from "@/lib/steam/session";

function redirectTo(path: string, requestUrl: string) {
  return NextResponse.redirect(new URL(path, requestUrl));
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const cookieStore = await cookies();
  const expectedState = readSteamOpenIdState(cookieStore);
  const actualState = url.searchParams.get("state");

  if (!expectedState || !actualState || expectedState !== actualState) {
    const response = redirectTo("/settings?steam=state-mismatch", request.url);
    clearSteamOpenIdState(response);
    return response;
  }

  const profile = await verifySteamOpenIdResponse(request.url);

  if (!profile) {
    const response = redirectTo("/settings?steam=connect-failed", request.url);
    clearSteamOpenIdState(response);
    return response;
  }

  const response = redirectTo("/settings?steam=connected", request.url);
  clearSteamOpenIdState(response);
  writeSteamProfile(response, profile);
  return response;
}
