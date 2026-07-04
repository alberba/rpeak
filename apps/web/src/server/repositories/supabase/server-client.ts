import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

/**
 * Cliente Supabase ligado a la sesión de la petición actual (cookies SSR), con la
 * clave anon: todo el acceso a datos pasa por RLS. Debe crearse una instancia nueva
 * por operación (nunca compartirse entre peticiones), tal y como recomienda @supabase/ssr.
 *
 * En Server Components las cookies son de solo lectura: si Supabase necesita renovar
 * el access token ahí, el intento de escritura se ignora silenciosamente y la sesión
 * se refresca en la siguiente petición a una Route Handler (login/callback/API).
 */
export async function getSupabaseServerClient(): Promise<SupabaseClient> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error("Supabase no está configurado: faltan NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  const cookieStore = await cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet) => {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Llamado desde un Server Component: no se pueden mutar cookies aquí.
        }
      },
    },
  });
}
