import { NextResponse } from "next/server";
import { sanitizeRedirectTarget } from "@/server/api/url-safety";
import { getSupabaseServerClient } from "@/server/repositories/supabase/server-client";

export const dynamic = "force-dynamic";

/** Recibe el "code" de vuelta de Google, lo intercambia por una sesión (PKCE) y redirige. */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const oauthError = url.searchParams.get("error_description") ?? url.searchParams.get("error");
  const next = sanitizeRedirectTarget(url.searchParams.get("next"));

  if (oauthError) {
    return NextResponse.redirect(new URL(`/?authError=${encodeURIComponent(oauthError)}`, url.origin));
  }
  if (!code) {
    return NextResponse.redirect(new URL("/?authError=missing_code", url.origin));
  }

  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(new URL(`/?authError=${encodeURIComponent(error.message)}`, url.origin));
  }

  return NextResponse.redirect(new URL(next, url.origin));
}
