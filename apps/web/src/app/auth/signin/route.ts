import { NextResponse } from "next/server";
import { getAppMode } from "@/server/mode";
import { sanitizeRedirectTarget } from "@/server/api/url-safety";
import { getSupabaseServerClient } from "@/server/repositories/supabase/server-client";

export const dynamic = "force-dynamic";

/** Inicia el flujo de Google OAuth (PKCE) y redirige al consentimiento de Google. */
export async function GET(request: Request) {
  if (getAppMode() === "demo") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const url = new URL(request.url);
  const next = sanitizeRedirectTarget(url.searchParams.get("next"));

  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${url.origin}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });

  if (error || !data.url) {
    const message = error?.message ?? "No se pudo iniciar el inicio de sesión con Google";
    return NextResponse.redirect(new URL(`/?authError=${encodeURIComponent(message)}`, url.origin));
  }

  return NextResponse.redirect(data.url);
}
