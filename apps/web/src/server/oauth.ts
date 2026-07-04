import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";

export const MCP_RESOURCE_URL = "https://rpeak.vercel.app";
export const MCP_AUTHORIZATION_SERVER_URL = "https://rpeak.vercel.app/oauth";

function getEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Falta ${name}`);
  return value;
}

export function getOAuthConfig() {
  return {
    clientId: getEnv("MCP_OAUTH_CLIENT_ID"),
    clientSecret: getEnv("MCP_OAUTH_CLIENT_SECRET"),
    signingSecret: getEnv("MCP_OAUTH_SIGNING_SECRET"),
  };
}

export function base64Url(input: Buffer | string) {
  const buffer = typeof input === "string" ? Buffer.from(input) : input;
  return buffer.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

export function sha256Base64Url(value: string) {
  return base64Url(createHash("sha256").update(value).digest());
}

export function hmacSignature(payload: string, secret: string) {
  return base64Url(createHmac("sha256", secret).update(payload).digest());
}

export function signJwt(payload: Record<string, unknown>, secret: string) {
  const header = base64Url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = base64Url(JSON.stringify(payload));
  const unsigned = `${header}.${body}`;
  const sig = hmacSignature(unsigned, secret);
  return `${unsigned}.${sig}`;
}

export function verifyJwt(token: string, secret: string): Record<string, unknown> | null {
  const [headerB64, bodyB64, sig] = token.split(".");
  if (!headerB64 || !bodyB64 || !sig) return null;
  const unsigned = `${headerB64}.${bodyB64}`;
  const expected = hmacSignature(unsigned, secret);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  const payload = JSON.parse(Buffer.from(bodyB64, "base64url").toString("utf8")) as Record<string, unknown>;
  return payload;
}

export function verifyAccessToken(token: string) {
  const { signingSecret } = getOAuthConfig();
  const payload = verifyJwt(token, signingSecret);
  if (!payload) return null;
  if (payload.iss !== MCP_AUTHORIZATION_SERVER_URL) return null;
  if (payload.aud !== MCP_RESOURCE_URL) return null;
  if (typeof payload.exp !== "number" || payload.exp * 1000 < Date.now()) return null;
  return payload;
}

export function encodeForm(data: Record<string, string>) {
  return new URLSearchParams(data).toString();
}

export function randomToken(bytes = 32) {
  return base64Url(randomBytes(bytes));
}

export function pkceChallenge(verifier: string) {
  return sha256Base64Url(verifier);
}

export function parseScope(scope: string | null) {
  return (scope ?? "").split(/\s+/).filter(Boolean);
}

export function buildResourceMetadata() {
  return {
    resource: MCP_RESOURCE_URL,
    authorization_servers: [MCP_AUTHORIZATION_SERVER_URL],
    scopes_supported: ["plans:read", "plans:write", "workouts:read"],
    resource_documentation: `${MCP_RESOURCE_URL}/docs/mcp-chatgpt`,
  };
}

export function buildAuthorizationServerMetadata() {
  return {
    issuer: MCP_AUTHORIZATION_SERVER_URL,
    authorization_endpoint: `${MCP_AUTHORIZATION_SERVER_URL}/authorize`,
    token_endpoint: `${MCP_AUTHORIZATION_SERVER_URL}/token`,
    registration_endpoint: `${MCP_AUTHORIZATION_SERVER_URL}/register`,
    response_types_supported: ["code"],
    grant_types_supported: ["authorization_code", "refresh_token"],
    code_challenge_methods_supported: ["S256"],
    token_endpoint_auth_methods_supported: ["client_secret_basic", "client_secret_post"],
    client_id_metadata_document_supported: true,
    scopes_supported: ["plans:read", "plans:write", "workouts:read"],
  };
}
