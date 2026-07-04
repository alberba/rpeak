import type { Exercise, ExerciseFilter, ExerciseRepository } from "@rpeak/domain";
import { exerciseFromRow, type ExerciseRow } from "./mappers";
import { getSupabaseServerClient } from "./server-client";

/** Implementación real contra Supabase Postgres. Tabla de solo lectura para la app (se seedea por migración). */
export class SupabaseExerciseRepository implements ExerciseRepository {
  async list(filter?: ExerciseFilter): Promise<Exercise[]> {
    const supabase = await getSupabaseServerClient();
    let query = supabase.from("exercises").select("*");

    if (filter?.query) query = query.ilike("name", `%${filter.query}%`);
    if (filter?.category) query = query.eq("category", filter.category);
    if (filter?.equipment) query = query.eq("equipment", filter.equipment);
    if (filter?.level) query = query.eq("level", filter.level);
    if (filter?.muscle) query = query.contains("primary_muscles", [filter.muscle]);

    const { data, error } = await query.order("name", { ascending: true });
    if (error) throw new Error(`No se pudieron listar los ejercicios: ${error.message}`);
    return (data as ExerciseRow[]).map(exerciseFromRow);
  }

  async getById(id: string): Promise<Exercise | null> {
    const supabase = await getSupabaseServerClient();
    const { data, error } = await supabase.from("exercises").select("*").eq("id", id).maybeSingle();
    if (error) throw new Error(`No se pudo obtener el ejercicio: ${error.message}`);
    if (!data) return null;
    return exerciseFromRow(data as ExerciseRow);
  }
}
