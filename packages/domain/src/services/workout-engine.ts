import type { WorkoutSession } from "../schemas/workout";
import type { RestContext } from "./rest-timer";

export interface WorkoutPointer {
  blockIndex: number;
  exerciseIndexInBlock: number;
  setIndex: number;
}

/**
 * Encuentra la siguiente serie pendiente en orden de ejecución.
 * En superseries se recorre por rondas (todas las series índice 0 de cada
 * ejercicio, luego todas las índice 1, ...) en vez de agotar un ejercicio entero.
 */
export function findNextPointer(session: Pick<WorkoutSession, "blocks">): WorkoutPointer | null {
  for (let blockIndex = 0; blockIndex < session.blocks.length; blockIndex += 1) {
    const block = session.blocks[blockIndex];
    if (!block) continue;

    if (block.type === "single") {
      const setIndex = block.exercise.sets.findIndex((s) => !s.completed);
      if (setIndex !== -1) {
        return { blockIndex, exerciseIndexInBlock: 0, setIndex };
      }
      continue;
    }

    const maxRounds = Math.max(...block.exercises.map((e) => e.sets.length));
    for (let round = 0; round < maxRounds; round += 1) {
      for (let exerciseIndexInBlock = 0; exerciseIndexInBlock < block.exercises.length; exerciseIndexInBlock += 1) {
        const exercise = block.exercises[exerciseIndexInBlock];
        const set = exercise?.sets[round];
        if (set && !set.completed) {
          return { blockIndex, exerciseIndexInBlock, setIndex: round };
        }
      }
    }
  }
  return null;
}

export function isWorkoutComplete(session: Pick<WorkoutSession, "blocks">): boolean {
  return findNextPointer(session) === null;
}

/**
 * Determina qué descanso aplica justo después de completar `completedPointer`,
 * comparándolo con el puntero siguiente. Si no hay siguiente puntero en el mismo
 * bloque, no se define descanso automático (el usuario avanza manualmente).
 */
export function restContextAfterCompleting(
  session: Pick<WorkoutSession, "blocks">,
  completedPointer: WorkoutPointer,
): RestContext {
  const next = findNextPointer(session);
  if (!next || next.blockIndex !== completedPointer.blockIndex) {
    return { kind: "none" };
  }

  const block = session.blocks[completedPointer.blockIndex];
  if (!block) return { kind: "none" };

  if (block.type === "single") {
    return { kind: "between-sets", restBetweenSetsSec: block.exercise.restBetweenSetsSec };
  }

  if (next.setIndex !== completedPointer.setIndex) {
    return { kind: "between-rounds", restBetweenRoundsSec: block.restBetweenRoundsSec };
  }
  return { kind: "between-exercises", restBetweenExercisesSec: block.restBetweenExercisesSec };
}
