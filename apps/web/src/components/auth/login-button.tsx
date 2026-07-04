"use client";

import { useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import { Button } from "@/components/ui/button";

/**
 * Componente de login desacoplado: no depende de que el backend de sesión de
 * Supabase esté terminado. Si hay credenciales públicas configuradas, dispara
 * el flujo OAuth de Google contra Supabase Auth; si no las hay, se desactiva
 * (la app funciona en modo demo, ver /login).
 */
export function GoogleLoginButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = getSupabaseBrowserClient();

  async function handleClick() {
    if (!supabase) return;
    setLoading(true);
    setError(null);
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (authError) {
      setError("No se pudo iniciar el proceso de inicio de sesión. Inténtalo de nuevo.");
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Button type="button" variant="primary" size="lg" disabled={!supabase || loading} onClick={handleClick} className="w-full">
        <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
          <path
            fill="currentColor"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1Z"
          />
          <path
            fill="currentColor"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.85A11 11 0 0 0 12 23Z"
          />
          <path fill="currentColor" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.05H2.18a11 11 0 0 0 0 9.9l3.66-2.85Z" />
          <path
            fill="currentColor"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1a11 11 0 0 0-9.82 6.05l3.66 2.85C6.71 7.3 9.14 5.38 12 5.38Z"
          />
        </svg>
        {loading ? "Redirigiendo…" : "Continuar con Google"}
      </Button>
      {!supabase ? <p className="text-center text-xs text-muted-foreground">Inicio de sesión con Google no disponible en este entorno.</p> : null}
      {error ? (
        <p role="alert" className="text-center text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
