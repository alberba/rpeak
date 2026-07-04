import type { UserProfile } from "@rpeak/domain";
import { ApiError } from "@/server/api/http";
import { getAppMode } from "@/server/mode";
import { DEMO_USER_ID } from "@/server/repositories/demo/seed";

const DEMO_PROFILE: UserProfile = {
  id: DEMO_USER_ID,
  email: "demo@rpeak.app",
  displayName: "Cuenta demo",
  avatarUrl: null,
  theme: "system",
  isDemo: true,
};

/**
 * Devuelve el usuario autenticado, o el usuario demo si no hay Supabase configurado.
 * En modo producción lanza si no hay sesión: las rutas/páginas deben redirigir a /login.
 */
export async function getCurrentUser(): Promise<UserProfile | null> {
  if (getAppMode() === "demo") return DEMO_PROFILE;
  const { getSupabaseSessionUser } = await import("@/server/repositories/supabase/session");
  return getSupabaseSessionUser();
}

/** Igual que getCurrentUser, pero lanza ApiError(401) si no hay sesión. Uso: rutas /api/v1/*. */
export async function requireUser(): Promise<UserProfile> {
  const user = await getCurrentUser();
  if (!user) throw new ApiError(401, "No autenticado");
  return user;
}
