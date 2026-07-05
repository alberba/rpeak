import type { WorkoutPointer, WorkoutSession } from "@rpeak/domain";
import type { StoredPauseState } from "@/lib/workout-storage";

export interface SetCompletionInput {
  weight: number;
  actualReps: number | null;
  actualDurationSec: number | null;
  rpe: number | null;
  startedAt: string;
}

function cloneSession(session: WorkoutSession): WorkoutSession {
  return JSON.parse(JSON.stringify(session)) as WorkoutSession;
}

/** Actualización inmutable de la serie señalada por el puntero. Puro: sin efectos ni IO. */
export function applySetCompletion(
  session: WorkoutSession,
  pointer: WorkoutPointer,
  input: SetCompletionInput,
  completedAt: string,
): WorkoutSession {
  const next = cloneSession(session);
  const block = next.blocks[pointer.blockIndex];
  const exercise = block.type === "single" ? block.exercise : block.exercises[pointer.exerciseIndexInBlock];
  const set = exercise.sets[pointer.setIndex];
  set.weight = input.weight;
  set.actualReps = input.actualReps;
  set.actualDurationSec = input.actualDurationSec;
  set.rpe = input.rpe;
  set.completed = true;
  set.startedAt = set.startedAt ?? input.startedAt;
  set.completedAt = completedAt;
  return next;
}

export interface ExerciseLocator {
  blockIndex: number;
  exerciseIndexInBlock: number;
}

export function updateExerciseNotes(session: WorkoutSession, locator: ExerciseLocator, notes: string): WorkoutSession {
  const next = cloneSession(session);
  const block = next.blocks[locator.blockIndex];
  const exercise = block.type === "single" ? block.exercise : block.exercises[locator.exerciseIndexInBlock];
  exercise.notes = notes;
  return next;
}

export interface SetEditInput {
  weight: number;
  actualReps: number | null;
  actualDurationSec: number | null;
  rpe: number | null;
}

/** Edita los valores registrados de una serie ya completada, sin tocar sus marcas de tiempo. */
export function editCompletedSet(session: WorkoutSession, pointer: WorkoutPointer, input: SetEditInput): WorkoutSession {
  const next = cloneSession(session);
  const block = next.blocks[pointer.blockIndex];
  const exercise = block.type === "single" ? block.exercise : block.exercises[pointer.exerciseIndexInBlock];
  const set = exercise.sets[pointer.setIndex];
  set.weight = input.weight;
  set.actualReps = input.actualReps;
  set.actualDurationSec = input.actualDurationSec;
  set.rpe = input.rpe;
  return next;
}

/** Deshace la finalización de una serie: vuelve a quedar pendiente para poder repetirla. */
export function undoSetCompletion(session: WorkoutSession, pointer: WorkoutPointer): WorkoutSession {
  const next = cloneSession(session);
  const block = next.blocks[pointer.blockIndex];
  const exercise = block.type === "single" ? block.exercise : block.exercises[pointer.exerciseIndexInBlock];
  const set = exercise.sets[pointer.setIndex];
  set.completed = false;
  set.startedAt = null;
  set.completedAt = null;
  return next;
}

/** Elimina una serie de un ejercicio del entrenamiento en curso. */
export function removeSet(session: WorkoutSession, pointer: WorkoutPointer): WorkoutSession {
  const next = cloneSession(session);
  const block = next.blocks[pointer.blockIndex];
  const exercise = block.type === "single" ? block.exercise : block.exercises[pointer.exerciseIndexInBlock];
  exercise.sets.splice(pointer.setIndex, 1);
  return next;
}

/** Sustituye el ejercicio de un bloque por otro (misma estructura de series). */
export function replaceExercise(session: WorkoutSession, locator: ExerciseLocator, exerciseId: string): WorkoutSession {
  const next = cloneSession(session);
  const block = next.blocks[locator.blockIndex];
  const exercise = block.type === "single" ? block.exercise : block.exercises[locator.exerciseIndexInBlock];
  exercise.exerciseId = exerciseId;
  return next;
}

/** Segundos transcurridos desde el inicio del entrenamiento, descontando el tiempo en pausa. */
export function computeActiveDurationSec(startedAt: string, now: string, pause: StoredPauseState | null): number {
  const totalMs = new Date(now).getTime() - new Date(startedAt).getTime();
  const pausedMs = pause?.totalPausedMs ?? 0;
  const ongoingPauseMs = pause?.pausedSince ? Math.max(0, new Date(now).getTime() - new Date(pause.pausedSince).getTime()) : 0;
  return Math.max(0, Math.floor((totalMs - pausedMs - ongoingPauseMs) / 1000));
}
