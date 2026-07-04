import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { sha256Base64Url } from "@/server/oauth";

export interface PendingAuthCode {
  userId: string;
  clientId: string;
  redirectUri: string;
  codeChallenge: string;
  scope: string;
  resource: string | null;
  state: string | null;
  expiresAt: number;
}

interface StoredAuthCode {
  user_id: string;
  client_id: string;
  redirect_uri: string;
  code_challenge: string;
  scope: string;
  resource: string | null;
  state: string | null;
  expires_at: string;
}

function createOAuthStorageClient(): SupabaseClient {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error("Falta SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY para OAuth");
  }

  return createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function saveAuthCode(code: string, record: PendingAuthCode) {
  const { error } = await createOAuthStorageClient().from("oauth_authorization_codes").insert({
    code_hash: sha256Base64Url(code),
    user_id: record.userId,
    client_id: record.clientId,
    redirect_uri: record.redirectUri,
    code_challenge: record.codeChallenge,
    scope: record.scope,
    resource: record.resource,
    state: record.state,
    expires_at: new Date(record.expiresAt).toISOString(),
  });

  if (error) throw new Error(`No se pudo guardar el código OAuth: ${error.message}`);
}

export async function consumeAuthCode(code: string): Promise<PendingAuthCode | null> {
  const { data, error } = await createOAuthStorageClient().rpc("consume_oauth_authorization_code", {
    p_code_hash: sha256Base64Url(code),
  });
  if (error) throw new Error(`No se pudo consumir el código OAuth: ${error.message}`);

  const stored = (data as StoredAuthCode[] | null)?.[0];
  if (!stored) return null;

  return {
    userId: stored.user_id,
    clientId: stored.client_id,
    redirectUri: stored.redirect_uri,
    codeChallenge: stored.code_challenge,
    scope: stored.scope,
    resource: stored.resource,
    state: stored.state,
    expiresAt: new Date(stored.expires_at).getTime(),
  };
}
