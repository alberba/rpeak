import { flattenWorkoutExercises, type WorkoutSession } from "@rpeak/domain";

export interface WorkoutStats {
  totalSets: number;
  completedSets: number;
  volumeKg: number;
  avgRpe: number | null;
}

export function computeWorkoutStats(session: WorkoutSession): WorkoutStats {
  let totalSets = 0;
  let completedSets = 0;
  let volumeKg = 0;
  let rpeSum = 0;
  let rpeCount = 0;

  for (const { exercise } of flattenWorkoutExercises(session)) {
    for (const set of exercise.sets) {
      totalSets += 1;
      if (!set.completed) continue;
      completedSets += 1;
      if (set.kind === "reps" && set.actualReps) volumeKg += set.actualReps * set.weight;
      if (set.rpe !== null) {
        rpeSum += set.rpe;
        rpeCount += 1;
      }
    }
  }

  return { totalSets, completedSets, volumeKg, avgRpe: rpeCount > 0 ? Math.round((rpeSum / rpeCount) * 10) / 10 : null };
}
