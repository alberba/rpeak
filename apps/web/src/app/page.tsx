import Link from "next/link";
import { getRepositories } from "@/server/repositories";
import { safeGetCurrentUser } from "@/lib/current-user";
import { Surface } from "@/components/ui/surface";
import { buttonClasses } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate, pluralize } from "@/lib/format";

export default async function DashboardPage() {
  const user = await safeGetCurrentUser();

  if (!user) {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-8">
        <EmptyState
          title="Inicia sesión para ver tu cuaderno"
          description="Tus planes y entrenamientos aparecerán aquí en cuanto inicies sesión."
          action={
            <Link href="/login" className={buttonClasses()}>
              Iniciar sesión
            </Link>
          }
        />
      </div>
    );
  }

  const { plans, workouts } = getRepositories();
  const [userPlans, recentWorkouts] = await Promise.all([plans.list(user.id), workouts.list(user.id, { limit: 5 })]);
  const inProgress = recentWorkouts.find((w) => w.finishedAt === null);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-6">
      <header>
        <p className="font-display text-2xl font-semibold">Hola, {user.displayName.split(" ")[0]}</p>
        <p className="text-sm text-muted-foreground">Tu cuaderno de entrenamiento en vivo</p>
      </header>

      {inProgress ? (
        <Surface className="flex items-center justify-between gap-3 border-primary/40 bg-primary/10">
          <div>
            <p className="text-sm font-semibold text-primary">Entrenamiento en curso</p>
            <p className="text-sm text-foreground">{inProgress.name}</p>
          </div>
          <Link href={`/entrenar/${inProgress.id}`} className={buttonClasses("primary", "sm")}>
            Continuar
          </Link>
        </Surface>
      ) : (
        <Surface className="flex flex-col gap-3">
          <h2 className="font-display text-lg font-semibold">Empezar entrenamiento</h2>
          <p className="text-sm text-muted-foreground">Elige un plan y regístralo serie a serie mientras entrenas.</p>
          <div className="flex gap-2">
            <Link href="/entrenar" className={buttonClasses()}>
              Entrenar ahora
            </Link>
            <Link href="/planes" className={buttonClasses("secondary")}>
              Ver planes
            </Link>
          </div>
        </Surface>
      )}

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">Tus planes</h2>
          <Link href="/planes" className="text-sm font-medium text-primary hover:underline">
            Ver todos
          </Link>
        </div>
        {userPlans.length === 0 ? (
          <EmptyState
            title="Todavía no tienes planes"
            description="Crea tu primera plantilla de entrenamiento."
            action={
              <Link href="/planes/nuevo" className={buttonClasses("secondary", "sm")}>
                Crear plan
              </Link>
            }
          />
        ) : (
          <ul className="flex flex-col gap-2">
            {userPlans.slice(0, 3).map((plan) => (
              <li key={plan.id}>
                <Surface className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{plan.name}</p>
                    <p className="text-xs text-muted-foreground">{pluralize(plan.blocks.length, "bloque", "bloques")}</p>
                  </div>
                  <Link href={`/planes/${plan.id}`} className="shrink-0 text-sm font-medium text-primary hover:underline">
                    Ver
                  </Link>
                </Surface>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-3 pb-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">Historial reciente</h2>
          <Link href="/historial" className="text-sm font-medium text-primary hover:underline">
            Ver todo
          </Link>
        </div>
        {recentWorkouts.length === 0 ? (
          <EmptyState title="Aún no hay entrenamientos registrados" />
        ) : (
          <ul className="flex flex-col gap-2">
            {recentWorkouts.map((session) => (
              <li key={session.id}>
                <Surface className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{session.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(session.startedAt)}
                      {session.finishedAt ? "" : " · en curso"}
                    </p>
                  </div>
                  <Link href={`/historial/${session.id}`} className="shrink-0 text-sm font-medium text-primary hover:underline">
                    Detalle
                  </Link>
                </Surface>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
