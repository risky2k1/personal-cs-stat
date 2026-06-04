import { NextResponse } from "next/server";
import {
  buildSteamLoginUrl,
  createSteamOpenIdState,
} from "@/lib/steam/openid";
import { writeSteamOpenIdState } from "@/lib/steam/session";

export async function GET(request: Request) {
  const state = createSteamOpenIdState();
  const response = NextResponse.redirect(
    buildSteamLoginUrl(request.url, state),
  );

  writeSteamOpenIdState(response, state);

  return response;
}
