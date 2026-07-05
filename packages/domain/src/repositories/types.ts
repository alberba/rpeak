import type { Exercise, ExerciseFilter } from "../schemas/exercise";
import type { Plan, PlanCreateInput, PlanUpdateInput } from "../schemas/plan";
import type { WorkoutCreateInput, WorkoutFilter, WorkoutSession, WorkoutUpdateInput } from "../schemas/workout";
import type { WorkoutAnalysisCreateInput, WorkoutAnalysisRecord } from "../schemas/analysis";

/**
 * Contratos de repositorio. Independientes de la infraestructura: la app web los
 * implementa contra Supabase (producción) o en memoria (modo demo), y el servidor
 * MCP los implementa contra Supabase con la service role key.
 */

export interface ExerciseRepository {
  list(filter?: ExerciseFilter): Promise<Exercise[]>;
  getById(id: string): Promise<Exercise | null>;
}

export interface PlanRepository {
  list(userId: string): Promise<Plan[]>;
  getById(id: string, userId: string): Promise<Plan | null>;
  create(userId: string, input: PlanCreateInput): Promise<Plan>;
  update(id: string, userId: string, input: PlanUpdateInput): Promise<Plan | null>;
  remove(id: string, userId: string): Promise<boolean>;
}

export interface WorkoutRepository {
  list(userId: string, filter?: WorkoutFilter): Promise<WorkoutSession[]>;
  getById(id: string, userId: string): Promise<WorkoutSession | null>;
  create(userId: string, input: WorkoutCreateInput): Promise<WorkoutSession>;
  update(id: string, userId: string, input: WorkoutUpdateInput): Promise<WorkoutSession | null>;
  remove(id: string, userId: string): Promise<boolean>;
}

export interface AnalysisRepository {
  getByWorkoutId(workoutId: string, userId: string): Promise<WorkoutAnalysisRecord | null>;
  upsert(userId: string, input: WorkoutAnalysisCreateInput): Promise<WorkoutAnalysisRecord>;
}
