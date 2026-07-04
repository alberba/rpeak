import Link from "next/link";
import { requireUser } from "@/lib/current-user";
import { getRepositories } from "@/server/repositories";
import { Surface } from "@/components/ui/surface";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { buttonClasses } from "@/components/ui/button";
import { pluralize } from "@/lib/format";
import { startFreeWorkoutAction, startWorkoutFromPlanAction } from "@/app/entrenar/actions";

export default async function StartWorkoutPage() {
  const user = await requireUser();
  const { plans, workouts } = getRepositories();
  const [userPlans, recentWorkouts] = await Promise.all([plans.list(user.id), workouts.list(user.id, { limit: 5 })]);
  const inProgress = recentWorkouts.find((w) => w.finishedAt === null);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-4 py-6">
      <header>
        <p className="font-display text-2xl font-semibold">Entrenar</p>
        <p className="text-sm text-muted">Elige un plan o empieza un entrenamiento libre.</p>
      </header>

      {inProgress ? (
        <Surface className="flex items-center justify-between gap-3 border-accent bg-accent-tint/40">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-accent-strong">Ya tienes un entrenamiento en curso</p>
            <p className="truncate text-sm text-foreground">{inProgress.name}</p>
          </div>
          <Link href={`/entrenar/${inProgress.id}`} className={buttonClasses("primary", "sm")}>
            Continuar
          </Link>
        </Surface>
      ) : (
        <>
          <section className="flex flex-col gap-2">
            <h2 className="font-display text-lg font-semibold">Desde un plan</h2>
            {userPlans.length === 0 ? (
              <EmptyState
                title="No tienes planes todavía"
                description="Crea uno para poder arrancar un entrenamiento guiado."
                action={
                  <Link href="/planes/nuevo" className={buttonClasses("secondary", "sm")}>
                    Crear plan
                  </Link>
                }
              />
            ) : (
              <ul className="flex flex-col gap-2">
                {userPlans.map((plan) => (
                  <li key={plan.id}>
                    <Surface className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate font-medium">{plan.name}</p>
                        <p className="text-xs text-muted">{pluralize(plan.blocks.length, "bloque", "bloques")}</p>
                      </div>
                      <form action={startWorkoutFromPlanAction.bind(null, plan.id)}>
                        <button type="submit" className={buttonClasses("primary", "sm")}>
                          Empezar
                        </button>
                      </form>
                    </Surface>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="flex flex-col gap-2 pb-6">
            <h2 className="font-display text-lg font-semibold">Entrenamiento libre</h2>
            <Surface>
              <form action={startFreeWorkoutAction} className="flex gap-2">
                <Input name="name" placeholder="Nombre del entrenamiento" defaultValue="Entrenamiento libre" aria-label="Nombre del entrenamiento libre" />
                <button type="submit" className={buttonClasses("secondary")}>
                  Empezar
                </button>
              </form>
            </Surface>
          </section>
        </>
      )}
    </div>
  );
}
