import type { PlanBlock, PlanExercise, PlanSetSpec, SetKind } from "@rpeak/domain";

function id(): string {
  return crypto.randomUUID();
}

export function createSetSpec(kind: SetKind, previous?: PlanSetSpec): PlanSetSpec {
  if (kind === "reps") {
    return {
      id: id(),
      kind: "reps",
      reps: previous?.reps ?? { min: 8, max: 12 },
      durationSec: null,
      weight: previous?.weight ?? 0,
      targetRpe: previous?.targetRpe ?? null,
    };
  }
  return {
    id: id(),
    kind: "time",
    reps: null,
    durationSec: previous?.durationSec ?? { min: 30, max: 30 },
    weight: previous?.weight ?? 0,
    targetRpe: previous?.targetRpe ?? null,
  };
}

export function createExercise(exerciseId: string): PlanExercise {
  return {
    id: id(),
    exerciseId,
    notes: "",
    restBetweenSetsSec: 90,
    sets: [createSetSpec("reps")],
  };
}

export function createSingleBlock(exerciseId: string): PlanBlock {
  return { type: "single", id: id(), exercise: createExercise(exerciseId) };
}

export function createSupersetBlock(exerciseId: string): PlanBlock {
  return {
    type: "superset",
    id: id(),
    exercises: [createExercise(exerciseId)],
    restBetweenExercisesSec: 15,
    restBetweenRoundsSec: 90,
  };
}
