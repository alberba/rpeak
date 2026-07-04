import { NextResponse } from "next/server";
import { getOAuthConfig, signJwt, sha256Base64Url } from "@/server/oauth";
import { consumeAuthCode } from "@/server/oauth-code-store";

export async function POST(request: Request) {
  const body = await request.formData();
  const grantType = String(body.get("grant_type") ?? "");
  const code = String(body.get("code") ?? "");
  const redirectUri = String(body.get("redirect_uri") ?? "");
  const formClientId = String(body.get("client_id") ?? "");
  const formClientSecret = String(body.get("client_secret") ?? "");
  const basicCredentials = parseBasicCredentials(request.headers.get("authorization"));
  const clientId = basicCredentials?.clientId ?? formClientId;
  const clientSecret = basicCredentials?.clientSecret ?? formClientSecret;
  const codeVerifier = String(body.get("code_verifier") ?? "");

  const config = getOAuthConfig();
  if (clientId !== config.clientId || clientSecret !== config.clientSecret) {
    return NextResponse.json({ error: "invalid_client" }, { status: 401 });
  }

  if (grantType !== "authorization_code") {
    return NextResponse.json({ error: "unsupported_grant_type" }, { status: 400 });
  }

  const authCode = await consumeAuthCode(code);
  if (!authCode || authCode.redirectUri !== redirectUri) {
    return NextResponse.json({ error: "invalid_grant" }, { status: 400 });
  }
  if (sha256Base64Url(codeVerifier) !== authCode.codeChallenge) {
    return NextResponse.json({ error: "invalid_grant" }, { status: 400 });
  }

  const accessToken = signJwt(
    {
      sub: authCode.userId,
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

function parseBasicCredentials(header: string | null) {
  if (!header?.startsWith("Basic ")) return null;

  try {
    const decoded = Buffer.from(header.slice("Basic ".length), "base64").toString("utf8");
    const separator = decoded.indexOf(":");
    if (separator < 0) return null;
    return {
      clientId: decodeURIComponent(decoded.slice(0, separator)),
      clientSecret: decodeURIComponent(decoded.slice(separator + 1)),
    };
  } catch {
    return null;
  }
}
