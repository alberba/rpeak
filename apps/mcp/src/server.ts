import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createSupabaseAdminClient } from "./supabase-client";
import { loadEnv, loadLocalUserId } from "./env";
import { registerPlanTools } from "./tools/plans";
import { registerWorkoutTools } from "./tools/workouts";

export function createRpeakMcpServer(userId = loadLocalUserId()) {
  const env = loadEnv();
  const supabase = createSupabaseAdminClient(env);

  const server = new McpServer({ name: "rpeak-mcp", version: "0.2.0" });
  registerPlanTools(server, supabase, userId);
  registerWorkoutTools(server, supabase, userId);

  return { env, server };
}
