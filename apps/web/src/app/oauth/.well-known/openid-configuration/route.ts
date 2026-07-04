import { NextResponse } from "next/server";
import { buildAuthorizationServerMetadata, MCP_AUTHORIZATION_SERVER_URL } from "@/server/oauth";

export async function GET() {
  return NextResponse.json({
    ...buildAuthorizationServerMetadata(),
    jwks_uri: `${MCP_AUTHORIZATION_SERVER_URL}/jwks.json`,
  });
}
