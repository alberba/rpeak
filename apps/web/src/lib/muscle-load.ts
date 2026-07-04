import type { Exercise, ExerciseMuscle, Plan, WorkoutSession } from "@rpeak/domain";
import { flattenPlanExercises, flattenWorkoutExercises } from "@rpeak/domain";

export type MuscleIntensity = Partial<Record<ExerciseMuscle, 1 | 2 | 3 | 4>>;

function normalize(loads: Partial<Record<ExerciseMuscle, number>>): MuscleIntensity {
  const max = Math.max(0, ...Object.values(loads));
  if (max === 0) return {};

  return Object.fromEntries(
    Object.entries(loads).map(([muscle, load]) => [muscle, Math.max(1, Math.ceil((load / max) * 4))]),
  ) as MuscleIntensity;
}

function addExerciseLoad(
  loads: Partial<Record<ExerciseMuscle, number>>,
  exercise: Exercise | undefined,
  sets: number,
) {
  if (!exercise || sets === 0) return;
  for (const muscle of exercise.primaryMuscles) loads[muscle] = (loads[muscle] ?? 0) + sets;
  for (const muscle of exercise.secondaryMuscles) loads[muscle] = (loads[muscle] ?? 0) + sets * 0.5;
}

export function exerciseMuscleIntensity(exercise: Exercise): MuscleIntensity {
  return Object.fromEntries([
    ...exercise.secondaryMuscles.map((muscle) => [muscle, 2] as const),
    ...exercise.primaryMuscles.map((muscle) => [muscle, 4] as const),
  ]);
}

export function planMuscleIntensity(plan: Pick<Plan, "blocks">, exercises: Map<string, Exercise>): MuscleIntensity {
  const loads: Partial<Record<ExerciseMuscle, number>> = {};
  for (const { exercise } of flattenPlanExercises(plan)) {
    addExerciseLoad(loads, exercises.get(exercise.exerciseId), exercise.sets.length);
  }
  return normalize(loads);
}

export function workoutMuscleIntensity(
  session: Pick<WorkoutSession, "blocks">,
  exercises: Map<string, Exercise>,
): MuscleIntensity {
  const loads: Partial<Record<ExerciseMuscle, number>> = {};
  for (const { exercise } of flattenWorkoutExercises(session)) {
    addExerciseLoad(loads, exercises.get(exercise.exerciseId), exercise.sets.filter((set) => set.completed).length);
  }
  return normalize(loads);
}
