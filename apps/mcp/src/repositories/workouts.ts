import type { SupabaseClient } from "@supabase/supabase-js";
import type { WorkoutFilter, WorkoutSession } from "@rpeak/domain";
import { workoutFromRow, type WorkoutSessionRow } from "../mappers";

/** Solo lectura: el MCP expone el historial de entrenamientos, no su edición. */
export async function listWorkouts(supabase: SupabaseClient, userId: string, filter?: WorkoutFilter): Promise<WorkoutSession[]> {
  let query = supabase.from("workout_sessions").select("*").eq("user_id", userId);

  if (filter?.planId) query = query.eq("plan_id", filter.planId);
  if (filter?.from) query = query.gte("started_at", filter.from);
  if (filter?.to) query = query.lte("started_at", filter.to);

  const { data, error } = await query.order("started_at", { ascending: false }).limit(filter?.limit ?? 50);
  if (error) throw new Error(`No se pudieron listar los entrenamientos: ${error.message}`);
  return (data as WorkoutSessionRow[]).map(workoutFromRow);
}

export async function getWorkout(supabase: SupabaseClient, userId: string, id: string): Promise<WorkoutSession | null> {
  const { data, error } = await supabase.from("workout_sessions").select("*").eq("id", id).eq("user_id", userId).maybeSingle();
  if (error) throw new Error(`No se pudo obtener el entrenamiento: ${error.message}`);
  return data ? workoutFromRow(data as WorkoutSessionRow) : null;
}
