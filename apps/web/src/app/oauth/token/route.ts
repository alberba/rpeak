import { NextResponse } from "next/server";
import { getOAuthConfig, signJwt, sha256Base64Url } from "@/server/oauth";
import { consumeAuthCode } from "@/server/oauth-code-store";

export async function POST(request: Request) {
  const body = await request.formData();
  const grantType = String(body.get("grant_type") ?? "");
  const code = String(body.get("code") ?? "");
  const redirectUri = String(body.get("redirect_uri") ?? "");
  const clientId = String(body.get("client_id") ?? "");
  const codeVerifier = String(body.get("code_verifier") ?? "");

  const config = getOAuthConfig();
  if (clientId !== config.clientId) {
    return NextResponse.json({ error: "invalid_client" }, { status: 401 });
  }

  if (grantType !== "authorization_code") {
    return NextResponse.json({ error: "unsupported_grant_type" }, { status: 400 });
  }

  const authCode = consumeAuthCode(code);
  if (!authCode || authCode.redirectUri !== redirectUri) {
    return NextResponse.json({ error: "invalid_grant" }, { status: 400 });
  }
  if (sha256Base64Url(codeVerifier) !== authCode.codeChallenge) {
    return NextResponse.json({ error: "invalid_grant" }, { status: 400 });
  }

  const accessToken = signJwt(
    {
      sub: "rpeak-user",
      aud: authCode.resource ?? "https://rpeak.vercel.app",
      scope: authCode.scope,
      iss: "https://rpeak.vercel.app/oauth",
      exp: Math.floor(Date.now() / 1000) + 3600,
      iat: Math.floor(Date.now() / 1000),
    },
    config.signingSecret,
  );

  return NextResponse.json({
    access_token: accessToken,
    token_type: "Bearer",
    expires_in: 3600,
    scope: authCode.scope,
  });
}
