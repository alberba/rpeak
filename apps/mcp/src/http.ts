import http from "node:http";
import { randomUUID } from "node:crypto";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createRpeakMcpServer } from "./server";

const AUTH_PREFIX = "Bearer ";

function assertBearerToken(request: http.IncomingMessage, expectedToken: string): boolean {
  const header = request.headers.authorization;
  if (!header?.startsWith(AUTH_PREFIX)) return false;
  return header.slice(AUTH_PREFIX.length) === expectedToken;
}

async function main() {
  const { server } = createRpeakMcpServer();
  const port = Number(process.env.MCP_PORT ?? process.env.PORT ?? 8787);
  const token = process.env.MCP_BEARER_TOKEN;

  if (!token) {
    throw new Error("Falta MCP_BEARER_TOKEN para exponer el servidor MCP por HTTP");
  }

  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: () => randomUUID(),
  });

  await server.connect(transport);

  const httpServer = http.createServer(async (req, res) => {
    if (req.url === "/healthz") {
      res.writeHead(200, { "content-type": "text/plain; charset=utf-8" });
      res.end("ok");
      return;
    }

    if (req.url !== "/mcp") {
      res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
      res.end("not found");
      return;
    }

    if (!assertBearerToken(req, token)) {
      res.writeHead(401, {
        "content-type": "application/json; charset=utf-8",
        "www-authenticate": 'Bearer realm="rpeak-mcp"',
      });
      res.end(JSON.stringify({ error: "unauthorized" }));
      return;
    }

    await transport.handleRequest(req, res);
  });

  httpServer.listen(port, () => {
    console.error(`rpeak-mcp: servidor listo (http) en :${port}/mcp`);
  });
}

main().catch((err) => {
  console.error("rpeak-mcp: error fatal", err);
  process.exit(1);
});
