import type { WorkoutPointer, WorkoutSession } from "@rpeak/domain";

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

export function updateExerciseNotes(session: WorkoutSession, pointer: WorkoutPointer, notes: string): WorkoutSession {
  const next = cloneSession(session);
  const block = next.blocks[pointer.blockIndex];
  const exercise = block.type === "single" ? block.exercise : block.exercises[pointer.exerciseIndexInBlock];
  exercise.notes = notes;
  return next;
}
