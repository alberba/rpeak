import type { Plan, PlanExercise } from "../schemas/plan";
import type { WorkoutCreateInput, WorkoutExercise, WorkoutSet } from "../schemas/workout";

export interface IdGenerator {
  (): string;
}

function toWorkoutSets(planExercise: PlanExercise, genId: IdGenerator): WorkoutSet[] {
  return planExercise.sets.map((planSet) => ({
    id: genId(),
    planSetId: planSet.id,
    kind: planSet.kind,
    targetReps: planSet.reps,
    targetDurationSec: planSet.durationSec,
    weight: planSet.weight,
    actualReps: null,
    actualDurationSec: null,
    rpe: null,
    completed: false,
    startedAt: null,
    completedAt: null,
  }));
}

function toWorkoutExercise(planExercise: PlanExercise, genId: IdGenerator): WorkoutExercise {
  return {
    id: genId(),
    planExerciseId: planExercise.id,
    exerciseId: planExercise.exerciseId,
    notes: planExercise.notes,
    restBetweenSetsSec: planExercise.restBetweenSetsSec,
    sets: toWorkoutSets(planExercise, genId),
  };
}

/** Instancia una sesión ejecutable a partir de una plantilla de plan. */
export function buildWorkoutFromPlan(plan: Plan, genId: IdGenerator, startedAt: string): WorkoutCreateInput {
  return {
    planId: plan.id,
    name: plan.name,
    notes: "",
    startedAt,
    finishedAt: null,
    blocks: plan.blocks.map((block) =>
      block.type === "single"
        ? { type: "single" as const, id: genId(), exercise: toWorkoutExercise(block.exercise, genId) }
        : {
            type: "superset" as const,
            id: genId(),
            exercises: block.exercises.map((exercise) => toWorkoutExercise(exercise, genId)),
            restBetweenExercisesSec: block.restBetweenExercisesSec,
            restBetweenRoundsSec: block.restBetweenRoundsSec,
          },
    ),
  };
}

/** Entrenamiento libre, sin plan asociado. */
export function buildFreeWorkout(name: string, startedAt: string): WorkoutCreateInput {
  return { planId: null, name, notes: "", startedAt, finishedAt: null, blocks: [] };
}
