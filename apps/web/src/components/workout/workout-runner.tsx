"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import {
  findNextPointer,
  restContextAfterCompleting,
  restDurationFor,
  type WorkoutBlock,
  type WorkoutExercise,
  type WorkoutSession,
} from "@rpeak/domain";
import { Surface } from "@/components/ui/surface";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { RestTimer } from "@/components/workout/rest-timer";
import { SetEntryCard, type SetEntryValue } from "@/components/workout/set-entry-card";
import { applySetCompletion, updateExerciseNotes } from "@/lib/workout-runtime";
import { loadRestState, saveRestState, type StoredRestState } from "@/lib/workout-storage";
import { formatDurationBetween, formatRange, formatWeight, formatSeconds, pluralize } from "@/lib/format";
import { cn } from "@/lib/cn";

function exerciseAt(block: WorkoutBlock, exerciseIndexInBlock: number): WorkoutExercise {
  return block.type === "single" ? block.exercise : block.exercises[exerciseIndexInBlock];
}

export function WorkoutRunner({
  workoutId,
  initialSession,
  initialNow,
  exerciseNames,
  saveBlocksAction,
  finishWorkoutAction,
  updateNotesAction,
}: {
  workoutId: string;
  initialSession: WorkoutSession;
  initialNow: string;
  exerciseNames: Record<string, string>;
  saveBlocksAction: (workoutId: string, blocks: WorkoutBlock[]) => Promise<void>;
  finishWorkoutAction: (workoutId: string) => Promise<void>;
  updateNotesAction: (workoutId: string, notes: string) => Promise<void>;
}) {
  const [session, setSession] = useState(initialSession);
  const [notes, setNotes] = useState(initialSession.notes);
  const [restState, setRestState] = useState<StoredRestState | null>(null);
  const [now, setNow] = useState(initialNow);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const activeStartedAtRef = useRef<string | null>(null);
  const skipInitialRestSaveRef = useRef(true);

  useEffect(() => {
    // Se lee tras hidratar para que el servidor y el primer render cliente coincidan.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRestState(loadRestState(workoutId));
    const id = setInterval(() => setNow(new Date().toISOString()), 1000);
    return () => clearInterval(id);
  }, [workoutId]);

  useEffect(() => {
    if (skipInitialRestSaveRef.current) {
      skipInitialRestSaveRef.current = false;
      return;
    }
    saveRestState(workoutId, restState);
  }, [workoutId, restState]);

  const pointer = useMemo(() => findNextPointer(session), [session]);
  const pointerKey = pointer ? `${pointer.blockIndex}:${pointer.exerciseIndexInBlock}:${pointer.setIndex}` : null;

  useEffect(() => {
    if (pointerKey) activeStartedAtRef.current = new Date().toISOString();
  }, [pointerKey]);

  function persist(blocks: WorkoutBlock[]) {
    startTransition(() => {
      saveBlocksAction(workoutId, blocks).catch(() => setSaveError("No se pudo guardar el progreso. Sigue entrenando: se reintentará al completar la próxima serie."));
    });
  }

  function handleComplete(value: SetEntryValue) {
    if (!pointer) return;
    setSaveError(null);
    const nowIso = new Date().toISOString();
    const updated = applySetCompletion(session, pointer, { ...value, startedAt: activeStartedAtRef.current ?? nowIso }, nowIso);
    setSession(updated);
    persist(updated.blocks);

    const nextPointer = findNextPointer(updated);
    if (nextPointer) {
      const restCtx = restContextAfterCompleting(updated, pointer);
      const restSec = restDurationFor(restCtx);
      setRestState(restSec > 0 ? { startedAt: nowIso, totalSec: restSec } : null);
    } else {
      setRestState(null);
    }
  }

  function handleExerciseNotesBlur(currentNotes: string) {
    if (!pointer) return;
    const currentExercise = exerciseAt(session.blocks[pointer.blockIndex], pointer.exerciseIndexInBlock);
    if (currentExercise.notes === currentNotes) return;
    const updated = updateExerciseNotes(session, pointer, currentNotes);
    setSession(updated);
    persist(updated.blocks);
  }

  function handleFinish() {
    if (!window.confirm("¿Finalizar el entrenamiento? Podrás verlo en el historial.")) return;
    startTransition(() => {
      finishWorkoutAction(workoutId).catch(() => setSaveError("No se pudo finalizar el entrenamiento. Inténtalo de nuevo."));
    });
  }

  function handleNotesBlur() {
    if (notes === initialSession.notes) return;
    startTransition(() => {
      updateNotesAction(workoutId, notes).catch(() => setSaveError("No se pudieron guardar las notas de la sesión."));
    });
  }

  const active = useMemo(() => {
    if (!pointer) return null;
    const block = session.blocks[pointer.blockIndex];
    const exercise = exerciseAt(block, pointer.exerciseIndexInBlock);
    const set = exercise.sets[pointer.setIndex];
    return { pointer, block, exercise, set };
  }, [pointer, session]);

  const completedSets = session.blocks.flatMap((block) => block.type === "single" ? block.exercise.sets : block.exercises.flatMap((exercise) => exercise.sets)).filter((set) => set.completed);
  const volume = completedSets.reduce((total, set) => total + set.weight * (set.actualReps ?? 0), 0);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-4 py-6">
      <header className="flex items-center justify-between gap-2 border-b border-border pb-4">
        <div className="min-w-0">
          <p className="truncate font-display text-xl font-semibold">{session.name}</p>
          <p className="font-mono text-sm text-muted-foreground">{formatDurationBetween(session.startedAt, now)}</p>
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={handleFinish}>
          Finalizar
        </Button>
      </header>

      <section className="grid grid-cols-3 gap-3" aria-label="Resumen del entrenamiento">
        <div><p className="text-xs text-muted-foreground">Duración</p><p className="font-mono text-lg text-primary">{formatDurationBetween(session.startedAt, now)}</p></div>
        <div><p className="text-xs text-muted-foreground">Volumen</p><p className="font-mono text-lg">{Math.round(volume)} kg</p></div>
        <div><p className="text-xs text-muted-foreground">Series</p><p className="font-mono text-lg">{completedSets.length}</p></div>
      </section>

      {saveError ? (
        <p role="alert" className="text-sm text-destructive">
          {saveError}
        </p>
      ) : null}

      {restState && active ? (
        <RestTimer
          restStartedAt={restState.startedAt}
          restSeconds={restState.totalSec}
          onSkip={() => setRestState(null)}
          onAddSeconds={(s) => setRestState((prev) => (prev ? { ...prev, totalSec: prev.totalSec + s } : prev))}
        />
      ) : !active ? (
        <Surface className="flex flex-col items-center gap-2 border-primary/40 bg-primary/10 py-8 text-center">
          <p className="font-display text-xl font-semibold">¡Entrenamiento completado!</p>
          <p className="text-sm text-muted-foreground">Buen trabajo. Puedes revisarlo en el historial.</p>
          <Button type="button" onClick={handleFinish} className="mt-2">
            Finalizar y guardar
          </Button>
        </Surface>
      ) : null}

      <div className="flex flex-col gap-5">
        {session.blocks.flatMap((block, blockIndex) => (block.type === "single" ? [block.exercise] : block.exercises).map((exercise, exerciseIndex) => ({ block, blockIndex, exercise, exerciseIndex }))).map(({ block, blockIndex, exercise, exerciseIndex }) => {
          const isActiveExercise = active?.pointer.blockIndex === blockIndex && active.pointer.exerciseIndexInBlock === exerciseIndex;
          return (
            <section key={exercise.id} className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
              <div className="flex items-start gap-3 px-4 pt-4">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 font-display text-lg font-bold text-primary" aria-hidden="true">{exerciseNames[exercise.exerciseId]?.slice(0, 1) ?? "E"}</div>
                <div className="min-w-0 flex-1">
                  <Link href={`/ejercicios/${exercise.exerciseId}`} className="font-display text-lg font-semibold text-primary underline-offset-4 hover:underline focus-visible:underline">
                    {exerciseNames[exercise.exerciseId] ?? "Ejercicio"}
                  </Link>
                  <p className="mt-1 text-xs text-muted-foreground">⏱ Descanso: {formatSeconds(block.type === "single" ? exercise.restBetweenSetsSec : block.restBetweenRoundsSec)}</p>
                </div>
                {block.type === "superset" ? <Badge tone="neutral">Superserie</Badge> : null}
              </div>

              <label className="block px-4 py-3">
                <span className="sr-only">Notas de {exerciseNames[exercise.exerciseId] ?? "ejercicio"}</span>
                <input defaultValue={exercise.notes} onBlur={(event) => isActiveExercise && handleExerciseNotesBlur(event.target.value)} placeholder="Añadir notas del ejercicio…" className="w-full border-0 bg-transparent text-sm text-muted-foreground outline-none placeholder:text-muted-foreground/70" />
              </label>

              <div className="grid grid-cols-[2.25rem_1fr_1fr_3.5rem_2.75rem] gap-2 border-y border-border bg-background/70 px-3 py-2 text-center text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                <span>Serie</span><span>kg</span><span>{exercise.sets[0]?.kind === "time" ? "Tiempo" : "Reps"}</span><span>RPE</span><span>✓</span>
              </div>
              {exercise.sets.map((set, setIndex) => {
                const isActiveSet = isActiveExercise && active?.pointer.setIndex === setIndex;
                if (isActiveSet) return <SetEntryCard key={set.id} setNumber={setIndex + 1} kind={set.kind} targetReps={set.targetReps} targetDurationSec={set.targetDurationSec} initialWeight={set.weight} initialActualReps={set.actualReps} initialActualDurationSec={set.actualDurationSec} initialRpe={set.rpe} onComplete={handleComplete} />;
                return (
                  <div key={set.id} className={cn("grid grid-cols-[2.25rem_1fr_1fr_3.5rem_2.75rem] items-center gap-2 border-t border-border px-3 py-3 text-center font-mono text-sm", set.completed && "bg-primary/10")}>
                    <span className="font-semibold">{setIndex + 1}</span><span>{formatWeight(set.weight)}</span><span>{set.completed ? (set.kind === "reps" ? set.actualReps : `${set.actualDurationSec}s`) : formatRange(set.kind === "reps" ? set.targetReps : set.targetDurationSec)}</span><span>{set.rpe ?? "—"}</span><span className={set.completed ? "text-primary" : "text-muted-foreground"}>{set.completed ? "●" : "○"}</span>
                  </div>
                );
              })}
            </section>
          );
        })}
      </div>

      <details className="rounded-xl border border-border bg-card p-4">
        <summary className="cursor-pointer font-display text-sm font-semibold">Ver todo el entrenamiento</summary>
        <ul className="mt-3 flex flex-col gap-2">
          {session.blocks.map((block) => {
            const exercises = block.type === "single" ? [block.exercise] : block.exercises;
            return (
              <li key={block.id} className="flex flex-col gap-1 border-t border-border pt-2 first:border-t-0 first:pt-0">
                {exercises.map((exercise) => {
                  const done = exercise.sets.filter((s) => s.completed).length;
                  return (
                    <div key={exercise.id} className="flex items-center justify-between gap-2 text-sm">
                      <span className="min-w-0 truncate">{exerciseNames[exercise.exerciseId] ?? "Ejercicio"}</span>
                      <Badge tone={done === exercise.sets.length ? "success" : "neutral"}>
                        {done}/{pluralize(exercise.sets.length, "serie", "series")}
                      </Badge>
                    </div>
                  );
                })}
              </li>
            );
          })}
        </ul>
      </details>

      <label className="flex flex-col gap-1 pb-6">
        <span className="text-xs font-medium text-muted-foreground">Notas de la sesión</span>
        <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} onBlur={handleNotesBlur} rows={2} placeholder="¿Cómo te has sentido hoy?" />
      </label>
    </div>
  );
}
