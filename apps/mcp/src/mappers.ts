import { ExerciseSchema, PlanSchema, WorkoutSessionSchema, type Exercise, type Plan, type WorkoutSession } from "@rpeak/domain";

export interface ExerciseRow {
  id: string;
  user_id?: string | null;
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

/** Filas tal y como las devuelve Postgrest (snake_case); ver apps/web/src/server/repositories/supabase/mappers.ts. */
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
