import Link from "next/link";
import { requireUser } from "@/lib/current-user";
import { getRepositories } from "@/server/repositories";
import { Surface } from "@/components/ui/surface";
import { EmptyState } from "@/components/ui/empty-state";
import { buttonClasses } from "@/components/ui/button";
import { pluralize } from "@/lib/format";

export default async function PlansPage() {
  const user = await requireUser();
  const { plans } = getRepositories();
  const userPlans = await plans.list(user.id);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-4 py-6">
      <header className="flex items-center justify-between">
        <div>
          <p className="font-display text-2xl font-semibold">Planes</p>
          <p className="text-sm text-muted-foreground">Plantillas de entrenamiento reutilizables</p>
        </div>
        <Link href="/planes/nuevo" className={buttonClasses("primary", "sm")}>
          + Nuevo
        </Link>
      </header>

      {userPlans.length === 0 ? (
        <EmptyState
          title="Todavía no tienes planes"
          description="Crea una plantilla con bloques de ejercicios, series y descansos."
          action={
            <Link href="/planes/nuevo" className={buttonClasses("secondary", "sm")}>
              Crear el primero
            </Link>
          }
        />
      ) : (
        <ul className="flex flex-col gap-2 pb-4">
          {userPlans.map((plan) => (
            <li key={plan.id}>
              <Link href={`/planes/${plan.id}`}>
                <Surface className="flex flex-col gap-1 transition-colors hover:border-primary/40">
                  <p className="font-medium">{plan.name}</p>
                  {plan.description ? <p className="line-clamp-2 text-sm text-muted-foreground">{plan.description}</p> : null}
                  <p className="text-xs text-muted-foreground">{pluralize(plan.blocks.length, "bloque", "bloques")}</p>
                </Surface>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
