import { redirect } from "next/navigation";
import type { UserProfile } from "@rpeak/domain";
import { getCurrentUser } from "@/server/auth";

/**
 * getCurrentUser() lanza en modo producción mientras la sesión de Supabase no
 * esté implementada en el servidor (fuera del alcance de este trabajo de
 * frontend). safeGetCurrentUser() absorbe ese caso para que el shell de la
 * app y el login sigan siendo navegables.
 */
export async function safeGetCurrentUser(): Promise<UserProfile | null> {
  try {
    return await getCurrentUser();
  } catch {
    return null;
  }
}

export async function requireUser(): Promise<UserProfile> {
  const user = await safeGetCurrentUser();
  if (!user) redirect("/login");
  return user;
}
