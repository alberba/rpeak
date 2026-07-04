import type { WorkoutCreateInput, WorkoutFilter, WorkoutRepository, WorkoutSession, WorkoutUpdateInput } from "@rpeak/domain";
import { workoutFromRow, type WorkoutSessionRow } from "./mappers";
import { getSupabaseServerClient } from "./server-client";

/** Implementación real contra Supabase Postgres + RLS (ver nota de doble filtrado en SupabasePlanRepository). */
export class SupabaseWorkoutRepository implements WorkoutRepository {
  async list(userId: string, filter?: WorkoutFilter): Promise<WorkoutSession[]> {
    const supabase = await getSupabaseServerClient();
    let query = supabase.from("workout_sessions").select("*").eq("user_id", userId);

    if (filter?.planId) query = query.eq("plan_id", filter.planId);
    if (filter?.from) query = query.gte("started_at", filter.from);
    if (filter?.to) query = query.lte("started_at", filter.to);

    const { data, error } = await query.order("started_at", { ascending: false }).limit(filter?.limit ?? 50);
    if (error) throw new Error(`No se pudieron listar los entrenamientos: ${error.message}`);
    return (data as WorkoutSessionRow[]).map(workoutFromRow);
  }

  async getById(id: string, userId: string): Promise<WorkoutSession | null> {
    const supabase = await getSupabaseServerClient();
    const { data, error } = await supabase.from("workout_sessions").select("*").eq("id", id).eq("user_id", userId).maybeSingle();
    if (error) throw new Error(`No se pudo obtener el entrenamiento: ${error.message}`);
    if (!data) return null;
    return workoutFromRow(data as WorkoutSessionRow);
  }

  async create(userId: string, input: WorkoutCreateInput): Promise<WorkoutSession> {
    const supabase = await getSupabaseServerClient();
    const { data, error } = await supabase
      .from("workout_sessions")
      .insert({
        user_id: userId,
        plan_id: input.planId,
        name: input.name,
        notes: input.notes,
        blocks: input.blocks,
        started_at: input.startedAt,
        finished_at: input.finishedAt,
      })
      .select("*")
      .single();
    if (error) throw new Error(`No se pudo crear el entrenamiento: ${error.message}`);
    return workoutFromRow(data as WorkoutSessionRow);
  }

  async update(id: string, userId: string, input: WorkoutUpdateInput): Promise<WorkoutSession | null> {
    const supabase = await getSupabaseServerClient();
    const patch: Record<string, unknown> = {};
    if (input.planId !== undefined) patch.plan_id = input.planId;
    if (input.name !== undefined) patch.name = input.name;
    if (input.notes !== undefined) patch.notes = input.notes;
    if (input.blocks !== undefined) patch.blocks = input.blocks;
    if (input.startedAt !== undefined) patch.started_at = input.startedAt;
    if (input.finishedAt !== undefined) patch.finished_at = input.finishedAt;

    const { data, error } = await supabase
      .from("workout_sessions")
      .update(patch)
      .eq("id", id)
      .eq("user_id", userId)
      .select("*")
      .maybeSingle();
    if (error) throw new Error(`No se pudo actualizar el entrenamiento: ${error.message}`);
    if (!data) return null;
    return workoutFromRow(data as WorkoutSessionRow);
  }

  async remove(id: string, userId: string): Promise<boolean> {
    const supabase = await getSupabaseServerClient();
    const { data, error } = await supabase
      .from("workout_sessions")
      .delete()
      .eq("id", id)
      .eq("user_id", userId)
      .select("id")
      .maybeSingle();
    if (error) throw new Error(`No se pudo eliminar el entrenamiento: ${error.message}`);
    return data !== null;
  }
}
