import { flattenWorkoutExercises, type ExerciseRepository, type WorkoutAnalysisRequest, type WorkoutSession } from "@rpeak/domain";

/** Arma el payload de análisis resolviendo el nombre de cada ejercicio referenciado en la sesión. */
export async function buildAnalysisRequest(
  workout: WorkoutSession,
  exerciseRepository: ExerciseRepository,
): Promise<WorkoutAnalysisRequest> {
  const flat = flattenWorkoutExercises(workout);

  const exercises = await Promise.all(
    flat.map(async ({ exercise }) => {
      const definition = await exerciseRepository.getById(exercise.exerciseId);
      return {
        name: definition?.name ?? exercise.exerciseId,
        sets: exercise.sets.map((set) => ({
          kind: set.kind,
          weight: set.weight,
          actualReps: set.actualReps,
          actualDurationSec: set.actualDurationSec,
          rpe: set.rpe,
          completed: set.completed,
        })),
      };
    }),
  );

  return {
    workoutId: workout.id,
    workoutName: workout.name,
    startedAt: workout.startedAt,
    finishedAt: workout.finishedAt,
    exercises,
    notes: workout.notes || undefined,
  };
}
