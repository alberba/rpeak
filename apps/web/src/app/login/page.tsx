import Link from "next/link";
import { redirect } from "next/navigation";
import { getAppMode } from "@/server/mode";
import { safeGetCurrentUser } from "@/lib/current-user";
import { Surface } from "@/components/ui/surface";
import { buttonClasses } from "@/components/ui/button";
import { GoogleLoginButton } from "@/components/auth/login-button";

export default async function LoginPage() {
  const mode = getAppMode();
  const user = await safeGetCurrentUser();
  if (user) redirect("/");

  return (
    <div className="mx-auto flex w-full max-w-sm flex-1 flex-col items-center justify-center gap-6 px-4 py-10">
      <div className="text-center">
        <p className="font-display text-3xl font-semibold">RPeak</p>
        <p className="mt-1 text-sm text-muted-foreground">Tu cuaderno de entrenamiento en vivo</p>
      </div>

      <Surface className="flex w-full flex-col gap-4">
        {mode === "demo" ? (
          <>
            <p className="text-sm text-muted-foreground">
              Este entorno corre en modo demo: puedes explorar RPeak con datos de ejemplo, sin crear ninguna cuenta.
            </p>
            <Link href="/" className={buttonClasses("primary", "lg")}>
              Continuar en modo demo
            </Link>
          </>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">Inicia sesión con tu cuenta de Google para acceder a tus planes y entrenamientos.</p>
            <GoogleLoginButton />
          </>
        )}
      </Surface>
    </div>
  );
}
