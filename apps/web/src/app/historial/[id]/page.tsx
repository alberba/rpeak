import Link from "next/link";
import { notFound } from "next/navigation";
import { flattenWorkoutExercises, type Exercise } from "@rpeak/domain";
import { requireUser } from "@/lib/current-user";
import { getRepositories } from "@/server/repositories";
import { Surface } from "@/components/ui/surface";
import { Badge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import { SetRail, type SetRailNode } from "@/components/workout/set-rail";
import { NotesEditor } from "@/components/workout/notes-editor";
import { formatDate, formatDurationBetween, formatRange, formatWeight } from "@/lib/format";
import { computeWorkoutStats } from "@/lib/workout-stats";
import { updateWorkoutNotesAction, deleteWorkoutAction } from "@/app/historial/[id]/actions";

export default async function WorkoutDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const { workouts, exercises } = getRepositories();
  const session = await workouts.getById(id, user.id);
  if (!session) notFound();

  const exerciseIds = [...new Set(flattenWorkoutExercises(session).map(({ exercise }) => exercise.exerciseId))];
  const resolved = await Promise.all(exerciseIds.map((exId) => exercises.getById(exId)));
  const exerciseNames = Object.fromEntries(resolved.filter((e): e is Exercise => e !== null).map((e) => [e.id, e.name]));

  const stats = computeWorkoutStats(session);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-4 py-6 pb-10">
      <Link href="/historial" className="text-sm font-medium text-brand hover:underline">
        ← Historial
      </Link>

      <header className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-display text-2xl font-semibold">{session.name}</p>
          <p className="text-sm text-muted">{formatDate(session.startedAt)}</p>
        </div>
        {session.finishedAt === null ? (
          <Link href={`/entrenar/${session.id}`} className={buttonClasses("primary", "sm")}>
            Continuar
          </Link>
        ) : (
          <Badge tone="success">Completado</Badge>
        )}
      </header>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Surface className="flex flex-col items-center gap-0.5 py-3">
          <p className="font-mono text-lg font-semibold">{formatDurationBetween(session.startedAt, session.finishedAt)}</p>
          <p className="text-xs text-muted">Duración</p>
        </Surface>
        <Surface className="flex flex-col items-center gap-0.5 py-3">
          <p className="font-mono text-lg font-semibold">
            {stats.completedSets}/{stats.totalSets}
          </p>
          <p className="text-xs text-muted">Series</p>
        </Surface>
        <Surface className="flex flex-col items-center gap-0.5 py-3">
          <p className="font-mono text-lg font-semibold">{Math.round(stats.volumeKg)}</p>
          <p className="text-xs text-muted">Volumen (kg)</p>
        </Surface>
        <Surface className="flex flex-col items-center gap-0.5 py-3">
          <p className="font-mono text-lg font-semibold">{stats.avgRpe ?? "—"}</p>
          <p className="text-xs text-muted">RPE medio</p>
        </Surface>
      </div>

      <section className="flex flex-col gap-3">
        {session.blocks.map((block) => {
          const blockExercises = block.type === "single" ? [block.exercise] : block.exercises;
          return (
            <Surface key={block.id} className="flex flex-col gap-4">
              {block.type === "superset" ? <p className="text-xs font-semibold uppercase tracking-wide text-muted">Superserie</p> : null}
              {blockExercises.map((exercise) => {
                const nodes: SetRailNode[] = exercise.sets.map((set, index) => ({
                  id: set.id,
                  title: `Serie ${index + 1}`,
                  subtitle: set.completed
                    ? `${set.kind === "reps" ? `${set.actualReps ?? "?"} reps` : `${set.actualDurationSec ?? "?"} s`} · ${formatWeight(set.weight)}${set.rpe ? ` · RPE ${set.rpe}` : ""}`
                    : `Objetivo: ${set.kind === "reps" ? formatRange(set.targetReps) : formatRange(set.targetDurationSec)}`,
                  state: set.completed ? "completed" : "skipped",
                }));
                return (
                  <div key={exercise.id} className="flex flex-col gap-2">
                    <p className="font-medium">{exerciseNames[exercise.exerciseId] ?? "Ejercicio"}</p>
                    {exercise.notes ? <p className="text-xs text-muted">{exercise.notes}</p> : null}
                    <SetRail nodes={nodes} />
                  </div>
                );
              })}
            </Surface>
          );
        })}
      </section>

      <NotesEditor workoutId={session.id} initialNotes={session.notes} action={updateWorkoutNotesAction} />

      <form action={deleteWorkoutAction.bind(null, session.id)}>
        <button type="submit" className={buttonClasses("danger", "sm")}>
          Eliminar entrenamiento
        </button>
      </form>
    </div>
  );
}
