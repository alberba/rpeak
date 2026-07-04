import { UserProfileSchema, type UserProfile } from "@rpeak/domain";
import { getSupabaseServerClient } from "./server-client";

/**
 * Lee la sesión de Supabase Auth (cookies SSR) y devuelve el perfil del usuario.
 * Usa getUser() (no getSession()) porque valida el token contra el servidor de Auth
 * en vez de confiar en lo que hay en la cookie sin verificar.
 */
export async function getSupabaseSessionUser(): Promise<UserProfile | null> {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user || !user.email) return null;

  const profileRow = await supabase.from("profiles").select("display_name, avatar_url, theme").eq("id", user.id).maybeSingle();

  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  const fallbackName = typeof meta.full_name === "string" ? meta.full_name : typeof meta.name === "string" ? meta.name : user.email;
  const fallbackAvatar = typeof meta.avatar_url === "string" ? meta.avatar_url : null;

  const profile: UserProfile = {
    id: user.id,
    email: user.email,
    displayName: profileRow.data?.display_name ?? fallbackName,
    avatarUrl: profileRow.data?.avatar_url ?? fallbackAvatar,
    theme: (profileRow.data?.theme as UserProfile["theme"] | undefined) ?? "system",
    isDemo: false,
  };

  return UserProfileSchema.parse(profile);
}
