import { redirect } from "next/navigation";
import { LogOut, ShieldCheck } from "lucide-react";
import { OpenRouterSettingsForm } from "@/components/settings/openrouter-settings-form";
import { buttonClasses } from "@/components/ui/button";
import { safeGetCurrentUser } from "@/lib/current-user";
import { getUserOpenRouterSettingsSummary } from "@/server/user-ai-settings";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await safeGetCurrentUser();
  if (!user) redirect("/login");

  const settings = user.isDemo
    ? { configured: false, keyHint: null, model: "openrouter/free" }
    : await getUserOpenRouterSettingsSummary(user.id);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-6">
      <header className="flex items-end justify-between gap-4 border-b border-border pb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Tu cuenta</p>
          <h1 className="mt-1 font-display text-2xl font-semibold">Configuración</h1>
        </div>
        <span className="max-w-40 truncate text-right text-xs text-muted-foreground">{user.email}</span>
      </header>

      {user.isDemo ? (
        <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
          Inicia sesión con Google para guardar tu propia clave de OpenRouter.
        </div>
      ) : (
        <OpenRouterSettingsForm initial={settings} />
      )}

      <div className="flex gap-3 rounded-xl border border-border bg-muted/40 p-4">
        <ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" />
        <div>
          <h2 className="text-sm font-semibold">Una clave por cuenta</h2>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Los análisis consumen únicamente el saldo y los límites de tu cuenta de OpenRouter. Otros usuarios no pueden usar ni leer tu clave.
          </p>
        </div>
      </div>

      {!user.isDemo ? (
        <form action="/auth/signout" method="post">
          <button type="submit" className={buttonClasses("secondary", "md", "w-full")}>
            <LogOut className="size-4" /> Cerrar sesión
          </button>
        </form>
      ) : null}
    </div>
  );
}
