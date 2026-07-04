import type { ExerciseRepository, PlanRepository, WorkoutRepository } from "@rpeak/domain";
import { getAppMode } from "@/server/mode";
import { DemoExerciseRepository } from "./demo/demo-exercise-repository";
import { DemoPlanRepository } from "./demo/demo-plan-repository";
import { DemoWorkoutRepository } from "./demo/demo-workout-repository";
import { SupabaseExerciseRepository } from "./supabase/supabase-exercise-repository";
import { SupabasePlanRepository } from "./supabase/supabase-plan-repository";
import { SupabaseWorkoutRepository } from "./supabase/supabase-workout-repository";

export interface Repositories {
  exercises: ExerciseRepository;
  plans: PlanRepository;
  workouts: WorkoutRepository;
}

let cached: Repositories | null = null;

/** Punto único de acceso a datos, usado tanto por Server Components como por las rutas /api/v1. */
export function getRepositories(): Repositories {
  if (cached) return cached;

  cached =
    getAppMode() === "demo"
      ? { exercises: new DemoExerciseRepository(), plans: new DemoPlanRepository(), workouts: new DemoWorkoutRepository() }
      : {
          exercises: new SupabaseExerciseRepository(),
          plans: new SupabasePlanRepository(),
          workouts: new SupabaseWorkoutRepository(),
        };
  return cached;
}
