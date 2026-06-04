import { NextResponse } from "next/server";
import { clearSteamSession } from "@/lib/steam/session";

export async function POST(request: Request) {
  const response = NextResponse.redirect(new URL("/settings?steam=disconnected", request.url));
  clearSteamSession(response);
  return response;
}
