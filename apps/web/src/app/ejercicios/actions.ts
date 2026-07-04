"use server";

import type { Exercise, ExerciseFilter } from "@rpeak/domain";
import { getRepositories } from "@/server/repositories";

const PICKER_LIMIT = 25;

/** Búsqueda usada por el selector de ejercicios del editor de planes. */
export async function searchExercisesAction(filter: ExerciseFilter): Promise<Exercise[]> {
  const { exercises } = getRepositories();
  const results = await exercises.list(filter);
  return results.slice(0, PICKER_LIMIT);
}
