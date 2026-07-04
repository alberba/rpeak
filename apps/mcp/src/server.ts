import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createSupabaseAdminClient } from "./supabase-client";
import { loadEnv } from "./env";
import { registerPlanTools } from "./tools/plans";
import { registerWorkoutTools } from "./tools/workouts";

export function createRpeakMcpServer() {
  const env = loadEnv();
  const supabase = createSupabaseAdminClient(env);

  const server = new McpServer({ name: "rpeak-mcp", version: "0.2.0" });
  registerPlanTools(server, supabase, env.RPEAK_USER_ID);
  registerWorkoutTools(server, supabase, env.RPEAK_USER_ID);

  return { env, server };
}
