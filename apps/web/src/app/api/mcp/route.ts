import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { createRpeakMcpServer } from "@rpeak/mcp/server";

export const dynamic = "force-dynamic";

function getBearerToken(request: Request) {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return null;
  return header.slice("Bearer ".length);
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
  const expectedToken = process.env.MCP_BEARER_TOKEN;
  if (!expectedToken) {
    return NextResponse.json({ error: "MCP no configurado" }, { status: 500 });
  }

  const token = getBearerToken(request);
  if (token !== expectedToken) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401, headers: { "www-authenticate": 'Bearer realm="rpeak-mcp"' } });
  }

  const { server } = createRpeakMcpServer();
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: () => randomUUID(),
  });

  await server.connect(transport);
  return transport.handleRequest(request);
}
