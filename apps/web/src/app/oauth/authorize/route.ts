import { NextResponse } from "next/server";
import { getOAuthConfig, randomToken } from "@/server/oauth";
import { saveAuthCode } from "@/server/oauth-code-store";
import { getSupabaseSessionUser } from "@/server/repositories/supabase/session";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const user = await getSupabaseSessionUser();
  if (!user) {
    const next = `${url.pathname}${url.search}`;
    return NextResponse.redirect(new URL(`/auth/signin?next=${encodeURIComponent(next)}`, url.origin));
  }
  const clientId = url.searchParams.get("client_id");
  const redirectUri = url.searchParams.get("redirect_uri");
  const codeChallenge = url.searchParams.get("code_challenge");
  const scope = url.searchParams.get("scope") ?? "";
  const state = url.searchParams.get("state");
  const resource = url.searchParams.get("resource");

  const { clientId: expectedClientId } = getOAuthConfig();
  if (clientId !== expectedClientId || !redirectUri || !codeChallenge) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const code = randomToken(24);
  await saveAuthCode(code, {
    userId: user.id,
    clientId,
    redirectUri,
    codeChallenge,
    scope,
    resource,
    state,
    expiresAt: Date.now() + 10 * 60 * 1000,
  });

  const out = new URL(redirectUri);
  out.searchParams.set("code", code);
  if (state) out.searchParams.set("state", state);
  return NextResponse.redirect(out);
}

export async function POST(request: Request) {
  const user = await getSupabaseSessionUser();
  if (!user) return NextResponse.json({ error: "login_required" }, { status: 401 });

  const body = await request.formData();
  const code = randomToken(24);
  const challenge = String(body.get("code_challenge") ?? "");
  const clientId = String(body.get("client_id") ?? "");
  const redirectUri = String(body.get("redirect_uri") ?? "");
  const scope = String(body.get("scope") ?? "");
  const resource = body.get("resource") ? String(body.get("resource")) : null;
  const state = body.get("state") ? String(body.get("state")) : null;

  const { clientId: expectedClientId } = getOAuthConfig();
  if (clientId !== expectedClientId || !redirectUri || !challenge) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  await saveAuthCode(code, {
    userId: user.id,
    clientId,
    redirectUri,
    codeChallenge: challenge,
    scope,
    resource,
    state,
    expiresAt: Date.now() + 10 * 60 * 1000,
  });

  const out = new URL(redirectUri);
  out.searchParams.set("code", code);
  if (state) out.searchParams.set("state", state);
  return NextResponse.redirect(out);
}
