import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Env } from "./env";

/** Cliente con la service role key: bypassa RLS, así que cada repositorio filtra manualmente por user_id. */
export function createSupabaseAdminClient(env: Env): SupabaseClient {
  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
