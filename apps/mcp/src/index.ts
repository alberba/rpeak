#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { loadEnv } from "./env";
import { createSupabaseAdminClient } from "./supabase-client";
import { registerPlanTools } from "./tools/plans";
import { registerWorkoutTools } from "./tools/workouts";

async function main() {
  const env = loadEnv();
  const supabase = createSupabaseAdminClient(env);

  const server = new McpServer({ name: "rpeak-mcp", version: "0.1.0" });
  registerPlanTools(server, supabase, env.RPEAK_USER_ID);
  registerWorkoutTools(server, supabase, env.RPEAK_USER_ID);

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("rpeak-mcp: servidor listo (stdio)");
}

main().catch((err) => {
  console.error("rpeak-mcp: error fatal", err);
  process.exit(1);
});
