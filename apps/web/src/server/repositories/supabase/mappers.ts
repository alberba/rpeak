import {
  ExerciseSchema,
  PlanSchema,
  WorkoutAnalysisRecordSchema,
  WorkoutSessionSchema,
  type Exercise,
  type Plan,
  type WorkoutAnalysisRecord,
  type WorkoutSession,
} from "@rpeak/domain";

/**
 * Filas tal y como las devuelve Postgrest (snake_case). Los bloques de plan/entrenamiento
 * se guardan como JSONB porque son un árbol recursivo (single/superset anidando ejercicios
 * y series); Zod es quien valida su forma al entrar y salir, la base de datos solo la persiste.
 */
export interface PlanRow {
  id: string;
  user_id: string;
  name: string;
  description: string;
  blocks: unknown;
  created_at: string;
  updated_at: string;
}

export interface WorkoutSessionRow {
  id: string;
  user_id: string;
  plan_id: string | null;
  name: string;
  notes: string;
  blocks: unknown;
  started_at: string;
  finished_at: string | null;
}

export interface ExerciseRow {
  id: string;
  name: string;
  force: string | null;
  level: string;
  mechanic: string | null;
  equipment: string | null;
  primary_muscles: string[];
  secondary_muscles: string[];
  instructions: string[];
  category: string;
}

export function planFromRow(row: PlanRow): Plan {
  return PlanSchema.parse({
    id: row.id,
    userId: row.user_id,
    name: row.name,
    description: row.description,
    blocks: row.blocks,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  });
}

export function workoutFromRow(row: WorkoutSessionRow): WorkoutSession {
  return WorkoutSessionSchema.parse({
    id: row.id,
    userId: row.user_id,
    planId: row.plan_id,
    name: row.name,
    notes: row.notes,
    blocks: row.blocks,
    startedAt: row.started_at,
    finishedAt: row.finished_at,
  });
}

export interface WorkoutAnalysisRow {
  id: string;
  workout_id: string;
  user_id: string;
  model: string;
  summary: string;
  highlights: string[];
  suggestions: string[];
  risk_flags: string[];
  created_at: string;
}

export function workoutAnalysisFromRow(row: WorkoutAnalysisRow): WorkoutAnalysisRecord {
  return WorkoutAnalysisRecordSchema.parse({
    id: row.id,
    workoutId: row.workout_id,
    userId: row.user_id,
    model: row.model,
    summary: row.summary,
    highlights: row.highlights,
    suggestions: row.suggestions,
    riskFlags: row.risk_flags,
    createdAt: row.created_at,
  });
}

export function exerciseFromRow(row: ExerciseRow): Exercise {
  return ExerciseSchema.parse({
    id: row.id,
    name: row.name,
    force: row.force,
    level: row.level,
    mechanic: row.mechanic,
    equipment: row.equipment,
    primaryMuscles: row.primary_muscles,
    secondaryMuscles: row.secondary_muscles,
    instructions: row.instructions,
    category: row.category,
  });
}
