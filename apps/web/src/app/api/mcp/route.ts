import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { createRpeakMcpServer } from "@rpeak/mcp/server";
import { verifyAccessToken } from "@/server/oauth";

export const dynamic = "force-dynamic";

function getBearerToken(request: Request) {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return null;
  return header.slice("Bearer ".length);
}

function getRequiredScope(request: Request) {
  const path = new URL(request.url).pathname;
  if (path.includes("/plans")) return "plans:read plans:write";
  return "workouts:read plans:read";
}

export async function GET(request: Request) {
  return handleMcpRequest(request);
}

export async function POST(request: Request) {
  return handleMcpRequest(request);
}

export async function DELETE(request: Request) {
  return handleMcpRequest(request);
}

async function handleMcpRequest(request: Request) {
  if (!process.env.MCP_OAUTH_SIGNING_SECRET || !process.env.MCP_OAUTH_CLIENT_ID) {
    return NextResponse.json({ error: "MCP no configurado" }, { status: 500 });
  }

  const token = getBearerToken(request);
  const payload = token ? verifyAccessToken(token) : null;
  if (!payload) {
    return NextResponse.json(
      { error: "unauthorized" },
      {
        status: 401,
        headers: {
          "www-authenticate": `Bearer resource_metadata="https://rpeak.vercel.app/.well-known/oauth-protected-resource", scope="${getRequiredScope(request)}"`,
        },
      },
    );
  }

  const { server } = createRpeakMcpServer();
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: () => randomUUID(),
  });

  await server.connect(transport);
  return transport.handleRequest(request);
}
