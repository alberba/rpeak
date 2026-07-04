import { NextResponse } from "next/server";
import { getOAuthConfig } from "@/server/oauth";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const config = getOAuthConfig();

  return NextResponse.json({
    client_id: config.clientId,
    client_secret: config.clientSecret,
    client_id_issued_at: Math.floor(Date.now() / 1000),
    client_secret_expires_at: 0,
    redirect_uris: Array.isArray(body.redirect_uris) ? body.redirect_uris : [],
    token_endpoint_auth_method: "client_secret_post",
    grant_types: ["authorization_code", "refresh_token"],
    response_types: ["code"],
  });
}
