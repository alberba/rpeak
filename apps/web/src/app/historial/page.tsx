import Link from "next/link";
import { requireUser } from "@/lib/current-user";
import { getRepositories } from "@/server/repositories";
import { Surface } from "@/components/ui/surface";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate, formatDurationBetween } from "@/lib/format";
import { computeWorkoutStats } from "@/lib/workout-stats";

export default async function HistoryPage() {
  const user = await requireUser();
  const { workouts } = getRepositories();
  const sessions = await workouts.list(user.id, { limit: 100 });

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-4 py-6">
      <header>
        <p className="font-display text-2xl font-semibold">Historial</p>
        <p className="text-sm text-muted">Tus entrenamientos registrados</p>
      </header>

      {sessions.length === 0 ? (
        <EmptyState title="Todavía no hay entrenamientos" description="Empieza uno desde la sección Entrenar." />
      ) : (
        <ul className="flex flex-col gap-2 pb-4">
          {sessions.map((session) => {
            const stats = computeWorkoutStats(session);
            return (
              <li key={session.id}>
                <Link href={`/historial/${session.id}`}>
                  <Surface className="flex flex-col gap-1 transition-colors hover:border-brand">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate font-medium">{session.name}</p>
                      {session.finishedAt === null ? <Badge tone="accent">En curso</Badge> : null}
                    </div>
                    <p className="text-xs text-muted">
                      {formatDate(session.startedAt)} · {formatDurationBetween(session.startedAt, session.finishedAt)} ·{" "}
                      {stats.completedSets}/{stats.totalSets} series
                    </p>
                  </Surface>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
