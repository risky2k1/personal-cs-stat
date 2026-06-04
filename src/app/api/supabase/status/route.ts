import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseConfig } from "@/lib/supabase/config";

export const dynamic = "force-dynamic";

export async function GET() {
  const { url, publishableKey } = getSupabaseConfig();
  const supabase = await createClient();
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();

  const authSettingsResponse = await fetch(`${url}/auth/v1/settings`, {
    headers: {
      apikey: publishableKey,
    },
    cache: "no-store",
  });

  const authSettings = authSettingsResponse.ok
    ? await authSettingsResponse.json()
    : null;

  return NextResponse.json({
    ok: authSettingsResponse.ok && !claimsError,
    projectRef: new URL(url).hostname.split(".")[0],
    auth: {
      hasSession: Boolean(claimsData?.claims),
      status: authSettingsResponse.status,
      externalProviders: authSettings?.external ?? {},
    },
    errors: {
      claims: claimsError?.message ?? null,
      authSettings: authSettingsResponse.ok
        ? null
        : `Auth settings request failed with status ${authSettingsResponse.status}`,
    },
  });
}
