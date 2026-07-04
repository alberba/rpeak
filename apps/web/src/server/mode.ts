/**
 * RPeak funciona en dos modos, elegidos automáticamente en el servidor:
 * - "demo": no hay credenciales de Supabase configuradas. Se usa un repositorio
 *   en memoria con datos de ejemplo, sin autenticación real, para poder evaluar
 *   la UI sin crear ningún proyecto externo.
 * - "production": hay credenciales de Supabase. Se exige sesión de Google OAuth
 *   y los datos se leen/escriben en PostgreSQL con RLS por usuario.
 *
 * Nunca se mezclan: el modo se decide una vez por proceso a partir de env vars.
 */
export type AppMode = "demo" | "production";

export function getAppMode(): AppMode {
  const hasSupabaseConfig = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  return hasSupabaseConfig ? "production" : "demo";
}

export function isDemoMode(): boolean {
  return getAppMode() === "demo";
}
