"use client";

import { createBrowserClient } from "@supabase/ssr";

/**
 * Cliente Supabase de navegador. Solo se instancia si hay credenciales
 * públicas configuradas (modo producción); en modo demo no se usa.
 * createBrowserClient sincroniza la sesión en cookies para que el servidor
 * (getSupabaseSessionUser) pueda leerla cuando se implemente.
 */
export function getSupabaseBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createBrowserClient(url, key);
}
