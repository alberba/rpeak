import { ApiError } from "@/server/api/http";
import { decryptCredential, encryptCredential } from "@/server/credential-crypto";
import { getSupabaseServerClient } from "@/server/repositories/supabase/server-client";

export const DEFAULT_OPENROUTER_MODEL = "openrouter/free";

export interface UserOpenRouterSettings {
  apiKey: string;
  model: string;
}

export interface UserOpenRouterSettingsSummary {
  configured: boolean;
  keyHint: string | null;
  model: string;
}

interface SettingsRow {
  openrouter_api_key_encrypted: string;
  openrouter_key_hint: string;
  openrouter_model: string;
}

async function readRow(userId: string): Promise<SettingsRow | null> {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("user_ai_settings")
    .select("openrouter_api_key_encrypted, openrouter_key_hint, openrouter_model")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw new ApiError(500, "No se pudo leer la configuración de IA");
  return data as SettingsRow | null;
}

export async function getUserOpenRouterSettings(userId: string): Promise<UserOpenRouterSettings | null> {
  const row = await readRow(userId);
  if (!row) return null;
  try {
    return { apiKey: decryptCredential(row.openrouter_api_key_encrypted), model: row.openrouter_model };
  } catch {
    throw new ApiError(500, "No se pudo descifrar la clave de OpenRouter");
  }
}

export async function getUserOpenRouterSettingsSummary(userId: string): Promise<UserOpenRouterSettingsSummary> {
  const row = await readRow(userId);
  return row
    ? { configured: true, keyHint: row.openrouter_key_hint, model: row.openrouter_model }
    : { configured: false, keyHint: null, model: DEFAULT_OPENROUTER_MODEL };
}

export async function saveUserOpenRouterSettings(userId: string, apiKey: string, model: string): Promise<void> {
  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.from("user_ai_settings").upsert({
    user_id: userId,
    openrouter_api_key_encrypted: encryptCredential(apiKey),
    openrouter_key_hint: apiKey.slice(-6),
    openrouter_model: model,
  });
  if (error) throw new ApiError(500, "No se pudo guardar la configuración de OpenRouter");
}

export async function updateUserOpenRouterModel(userId: string, model: string): Promise<UserOpenRouterSettingsSummary> {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("user_ai_settings")
    .update({ openrouter_model: model })
    .eq("user_id", userId)
    .select("openrouter_key_hint, openrouter_model")
    .maybeSingle();

  if (error) throw new ApiError(500, "No se pudo guardar el modelo de OpenRouter");
  if (!data) throw new ApiError(400, "Añade una clave de OpenRouter antes de guardar el modelo");

  const row = data as Pick<SettingsRow, "openrouter_key_hint" | "openrouter_model">;
  return { configured: true, keyHint: row.openrouter_key_hint, model: row.openrouter_model };
}

export async function deleteUserOpenRouterSettings(userId: string): Promise<void> {
  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.from("user_ai_settings").delete().eq("user_id", userId);
  if (error) throw new ApiError(500, "No se pudo eliminar la configuración de OpenRouter");
}
