#!/usr/bin/env node
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createRpeakMcpServer } from "./server";

async function main() {
  const { server } = createRpeakMcpServer();

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("rpeak-mcp: servidor listo (stdio)");
}

main().catch((err) => {
  console.error("rpeak-mcp: error fatal", err);
  process.exit(1);
});
