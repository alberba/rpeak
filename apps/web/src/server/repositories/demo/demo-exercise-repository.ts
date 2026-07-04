import type { Exercise, ExerciseFilter, ExerciseRepository } from "@rpeak/domain";
import exercisesData from "@rpeak/domain/data/exercises.json";

const ALL_EXERCISES = exercisesData as Exercise[];

export class DemoExerciseRepository implements ExerciseRepository {
  async list(filter?: ExerciseFilter): Promise<Exercise[]> {
    let results = ALL_EXERCISES;
    if (filter?.category) results = results.filter((e) => e.category === filter.category);
    if (filter?.equipment) results = results.filter((e) => e.equipment === filter.equipment);
    if (filter?.level) results = results.filter((e) => e.level === filter.level);
    if (filter?.muscle) {
      results = results.filter(
        (e) => e.primaryMuscles.includes(filter.muscle!) || e.secondaryMuscles.includes(filter.muscle!),
      );
    }
    if (filter?.query) {
      const q = filter.query.toLowerCase();
      results = results.filter((e) => e.name.toLowerCase().includes(q));
    }
    return results;
  }

  async getById(id: string): Promise<Exercise | null> {
    return ALL_EXERCISES.find((e) => e.id === id) ?? null;
  }
}
