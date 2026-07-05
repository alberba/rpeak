"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import {
  findNextPointer,
  restContextAfterCompleting,
  restDurationFor,
  type Exercise,
  type WorkoutBlock,
  type WorkoutExercise,
  type WorkoutPointer,
  type WorkoutSession,
} from "@rpeak/domain";
import { Pencil, Repeat, Trash2, Undo2 } from "lucide-react";
import { Surface } from "@/components/ui/surface";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { RestTimer } from "@/components/workout/rest-timer";
import { SetEntryCard, type SetEntryValue } from "@/components/workout/set-entry-card";
import { ExercisePicker } from "@/components/plans/exercise-picker";
import {
  applySetCompletion,
  computeActiveDurationSec,
  editCompletedSet,
  removeSet,
  replaceExercise,
  undoSetCompletion,
  updateExerciseNotes,
  type ExerciseLocator,
} from "@/lib/workout-runtime";
import { loadPauseState, loadRestState, savePauseState, saveRestState, type StoredPauseState, type StoredRestState } from "@/lib/workout-storage";
import type { ExerciseSwap } from "@/app/entrenar/[id]/actions";
import { formatRange, formatSeconds, formatWeight, pluralize } from "@/lib/format";
import { cn } from "@/lib/cn";

const SET_ROW_GRID = "grid-cols-[2rem_1fr_1fr_3rem_auto]";

function exerciseAt(block: WorkoutBlock, exerciseIndexInBlock: number): WorkoutExercise {
  return block.type === "single" ? block.exercise : block.exercises[exerciseIndexInBlock];
}

export function WorkoutRunner({
  workoutId,
  planId,
  initialSession,
  initialNow,
  exerciseNames,
  saveBlocksAction,
  finishWorkoutAction,
  updateNotesAction,
  applyExerciseSwapsAction,
}: {
  workoutId: string;
  planId: string | null;
  initialSession: WorkoutSession;
  initialNow: string;
  exerciseNames: Record<string, string>;
  saveBlocksAction: (workoutId: string, blocks: WorkoutBlock[]) => Promise<void>;
  finishWorkoutAction: (workoutId: string) => Promise<void>;
  updateNotesAction: (workoutId: string, notes: string) => Promise<void>;
  applyExerciseSwapsAction: (planId: string, swaps: ExerciseSwap[]) => Promise<void>;
}) {
  const [session, setSession] = useState(initialSession);
  const [notes, setNotes] = useState(initialSession.notes);
  const [restState, setRestState] = useState<StoredRestState | null>(null);
  const [pauseState, setPauseState] = useState<StoredPauseState>({ pausedSince: null, totalPausedMs: 0 });
  const [now, setNow] = useState(initialNow);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [editingSetId, setEditingSetId] = useState<string | null>(null);
  const [replacingLocator, setReplacingLocator] = useState<ExerciseLocator | null>(null);
  const [nameOverrides, setNameOverrides] = useState<Record<string, string>>({});
  const [, startTransition] = useTransition();
  const activeStartedAtRef = useRef<string | null>(null);
  const skipInitialRestSaveRef = useRef(true);
  const skipInitialPauseSaveRef = useRef(true);
  const swapsRef = useRef<ExerciseSwap[]>([]);

  useEffect(() => {
    // Se lee tras hidratar para que el servidor y el primer render cliente coincidan.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRestState(loadRestState(workoutId));
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPauseState(loadPauseState(workoutId) ?? { pausedSince: null, totalPausedMs: 0 });
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

  useEffect(() => {
    if (skipInitialPauseSaveRef.current) {
      skipInitialPauseSaveRef.current = false;
      return;
    }
    savePauseState(workoutId, pauseState);
  }, [workoutId, pauseState]);

  const isPaused = pauseState.pausedSince !== null;
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

  function handleUndo(setPointer: WorkoutPointer) {
    setSaveError(null);
    setRestState(null);
    const updated = undoSetCompletion(session, setPointer);
    setSession(updated);
    persist(updated.blocks);
  }

  function handleSaveEdit(setPointer: WorkoutPointer, value: SetEntryValue) {
    setSaveError(null);
    const updated = editCompletedSet(session, setPointer, value);
    setSession(updated);
    persist(updated.blocks);
    setEditingSetId(null);
  }

  function handleDeleteSet(setPointer: WorkoutPointer, setNumber: number) {
    if (!window.confirm(`¿Eliminar la serie ${setNumber}?`)) return;
    setSaveError(null);
    const updated = removeSet(session, setPointer);
    setSession(updated);
    persist(updated.blocks);
  }

  function handleReplaceExercise(locator: ExerciseLocator, exercise: Exercise) {
    const currentBlock = session.blocks[locator.blockIndex];
    const currentExercise = exerciseAt(currentBlock, locator.exerciseIndexInBlock);
    if (currentExercise.planExerciseId) {
      swapsRef.current = [
        ...swapsRef.current.filter((s) => s.planExerciseId !== currentExercise.planExerciseId),
        { planExerciseId: currentExercise.planExerciseId, exerciseId: exercise.id },
      ];
    }
    const updated = replaceExercise(session, locator, exercise.id);
    setSession(updated);
    persist(updated.blocks);
    setNameOverrides((prev) => ({ ...prev, [exercise.id]: exercise.name }));
    setReplacingLocator(null);
  }

  function handleExerciseNotesBlur(locator: ExerciseLocator, currentNotes: string) {
    const currentExercise = exerciseAt(session.blocks[locator.blockIndex], locator.exerciseIndexInBlock);
    if (currentExercise.notes === currentNotes) return;
    const updated = updateExerciseNotes(session, locator, currentNotes);
    setSession(updated);
    persist(updated.blocks);
  }

  function handlePauseToggle() {
    const nowIso = new Date().toISOString();
    if (pauseState.pausedSince) {
      const elapsed = new Date(nowIso).getTime() - new Date(pauseState.pausedSince).getTime();
      setPauseState({ pausedSince: null, totalPausedMs: pauseState.totalPausedMs + elapsed });
      setRestState((prev) => (prev ? { ...prev, startedAt: new Date(new Date(prev.startedAt).getTime() + elapsed).toISOString() } : prev));
    } else {
      setPauseState({ ...pauseState, pausedSince: nowIso });
    }
  }

  async function handleFinish() {
    if (!window.confirm("¿Finalizar el entrenamiento? Podrás verlo en el historial.")) return;
    if (planId && swapsRef.current.length > 0) {
      const updatePlan = window.confirm("Has reemplazado ejercicios durante este entrenamiento. ¿Quieres actualizar también el plan con estos cambios?");
      if (updatePlan) {
        try {
          await applyExerciseSwapsAction(planId, swapsRef.current);
        } catch {
          setSaveError("No se pudo actualizar el plan con los ejercicios reemplazados.");
        }
      }
    }
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
  const durationSec = computeActiveDurationSec(session.startedAt, now, pauseState);
  const resolveName = (exerciseId: string) => nameOverrides[exerciseId] ?? exerciseNames[exerciseId] ?? "Ejercicio";

  return (
    <div className={cn("mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-4 py-6", restState && !isPaused && "pb-40")}>
      <header className="sticky top-14 z-10 -mx-4 flex flex-col gap-2 border-b border-border bg-background/95 px-4 py-3 backdrop-blur-md">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate font-display text-lg font-semibold">{session.name}</p>
          <div className="flex shrink-0 items-center gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={handlePauseToggle}>
              {isPaused ? "Reanudar" : "Pausar"}
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={handleFinish}>
              Finalizar
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div><p className="text-[10px] text-muted-foreground">Duración</p><p className="font-mono text-base text-primary">{formatSeconds(durationSec)}</p></div>
          <div><p className="text-[10px] text-muted-foreground">Volumen</p><p className="font-mono text-base">{Math.round(volume)} kg</p></div>
          <div><p className="text-[10px] text-muted-foreground">Series</p><p className="font-mono text-base">{completedSets.length}</p></div>
        </div>
      </header>

      {saveError ? (
        <p role="alert" className="text-sm text-destructive">
          {saveError}
        </p>
      ) : null}

      {isPaused ? (
        <Surface className="flex flex-col items-center gap-2 border-amber-500/40 bg-amber-500/10 py-8 text-center">
          <p className="font-display text-xl font-semibold">Entrenamiento en pausa</p>
          <p className="text-sm text-muted-foreground">El tiempo no avanza mientras esté en pausa.</p>
          <Button type="button" onClick={handlePauseToggle} className="mt-2">
            Reanudar
          </Button>
        </Surface>
      ) : restState && active ? (
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
          const locator: ExerciseLocator = { blockIndex, exerciseIndexInBlock: exerciseIndex };
          const isReplacing = replacingLocator?.blockIndex === blockIndex && replacingLocator.exerciseIndexInBlock === exerciseIndex;
          return (
            <section key={exercise.id} className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
              <div className="flex items-start gap-3 px-4 pt-4">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 font-display text-lg font-bold text-primary" aria-hidden="true">{resolveName(exercise.exerciseId).slice(0, 1)}</div>
                <div className="min-w-0 flex-1">
                  <Link href={`/ejercicios/${exercise.exerciseId}`} className="font-display text-lg font-semibold text-primary underline-offset-4 hover:underline focus-visible:underline">
                    {resolveName(exercise.exerciseId)}
                  </Link>
                  <p className="mt-1 text-xs text-muted-foreground">⏱ Descanso: {formatSeconds(block.type === "single" ? exercise.restBetweenSetsSec : block.restBetweenRoundsSec)}</p>
                </div>
                {block.type === "superset" ? <Badge tone="neutral">Superserie</Badge> : null}
                <button
                  type="button"
                  onClick={() => setReplacingLocator(isReplacing ? null : locator)}
                  aria-label={`Reemplazar ${resolveName(exercise.exerciseId)}`}
                  className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground"
                >
                  <Repeat className="size-4" />
                </button>
              </div>

              {isReplacing ? (
                <div className="px-4 pt-3">
                  <ExercisePicker onSelect={(picked) => handleReplaceExercise(locator, picked)} onClose={() => setReplacingLocator(null)} />
                </div>
              ) : null}

              <label className="block px-4 py-3">
                <span className="sr-only">Notas de {resolveName(exercise.exerciseId)}</span>
                <input defaultValue={exercise.notes} onBlur={(event) => handleExerciseNotesBlur(locator, event.target.value)} placeholder="Añadir notas del ejercicio…" className="w-full border-0 bg-transparent text-sm text-muted-foreground outline-none placeholder:text-muted-foreground/70" />
              </label>

              <div className={cn("grid items-center gap-2 border-y border-border bg-background/70 px-3 py-2 text-center text-[10px] font-semibold uppercase tracking-wide text-muted-foreground", SET_ROW_GRID)}>
                <span>Serie</span><span>kg</span><span>{exercise.sets[0]?.kind === "time" ? "Tiempo" : "Reps"}</span><span>RPE</span><span>Acciones</span>
              </div>
              {exercise.sets.map((set, setIndex) => {
                const setPointer: WorkoutPointer = { blockIndex, exerciseIndexInBlock: exerciseIndex, setIndex };
                const isActiveSet = isActiveExercise && active?.pointer.setIndex === setIndex && !isPaused;
                if (isActiveSet) {
                  return (
                    <SetEntryCard
                      key={set.id}
                      setNumber={setIndex + 1}
                      kind={set.kind}
                      targetReps={set.targetReps}
                      targetDurationSec={set.targetDurationSec}
                      initialWeight={set.weight}
                      initialActualReps={set.actualReps}
                      initialActualDurationSec={set.actualDurationSec}
                      initialRpe={set.rpe}
                      onComplete={handleComplete}
                      onDelete={() => handleDeleteSet(setPointer, setIndex + 1)}
                    />
                  );
                }
                if (set.completed && editingSetId === set.id) {
                  return (
                    <SetEntryCard
                      key={set.id}
                      mode="save"
                      setNumber={setIndex + 1}
                      kind={set.kind}
                      targetReps={set.targetReps}
                      targetDurationSec={set.targetDurationSec}
                      initialWeight={set.weight}
                      initialActualReps={set.actualReps}
                      initialActualDurationSec={set.actualDurationSec}
                      initialRpe={set.rpe}
                      onComplete={(value) => handleSaveEdit(setPointer, value)}
                      onCancel={() => setEditingSetId(null)}
                      onDelete={() => handleDeleteSet(setPointer, setIndex + 1)}
                    />
                  );
                }
                return (
                  <div key={set.id} className={cn("grid items-center gap-2 border-t border-border px-3 py-3 text-center font-mono text-sm", SET_ROW_GRID, set.completed && "bg-primary/10")}>
                    <span className="font-semibold">{setIndex + 1}</span>
                    <span>{formatWeight(set.weight)}</span>
                    <span>{set.completed ? (set.kind === "reps" ? set.actualReps : `${set.actualDurationSec}s`) : formatRange(set.kind === "reps" ? set.targetReps : set.targetDurationSec)}</span>
                    <span>{set.rpe ?? "—"}</span>
                    <div className="flex items-center justify-end gap-1">
                      {set.completed ? (
                        <>
                          <button type="button" onClick={() => setEditingSetId(set.id)} aria-label={`Editar serie ${setIndex + 1}`} className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:text-foreground">
                            <Pencil className="size-3.5" />
                          </button>
                          <button type="button" onClick={() => handleUndo(setPointer)} aria-label={`Deshacer serie ${setIndex + 1}`} className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:text-foreground">
                            <Undo2 className="size-3.5" />
                          </button>
                        </>
                      ) : null}
                      <button type="button" onClick={() => handleDeleteSet(setPointer, setIndex + 1)} aria-label={`Eliminar serie ${setIndex + 1}`} className="flex size-7 items-center justify-center rounded-md text-destructive/80 hover:text-destructive">
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
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
                      <span className="min-w-0 truncate">{resolveName(exercise.exerciseId)}</span>
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
