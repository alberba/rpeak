import type { SupabaseClient } from "@supabase/supabase-js";
import type { Exercise, ExerciseFilter } from "@rpeak/domain";
import type { ExerciseCategory, ExerciseEquipment, ExerciseLevel, ExerciseMuscle } from "@rpeak/domain";
import { exerciseFromRow, type ExerciseRow } from "../mappers";

export async function searchExercises(
  supabase: SupabaseClient,
  filter: ExerciseFilter,
  limit: number,
  userId: string,
): Promise<Exercise[]> {
  let query = supabase.from("exercises").select("*").or(`user_id.is.null,user_id.eq.${userId}`);
  if (filter.query) query = query.ilike("name", `%${filter.query}%`);
  if (filter.category) query = query.eq("category", filter.category);
  if (filter.equipment) query = query.eq("equipment", filter.equipment);
  if (filter.level) query = query.eq("level", filter.level);
  if (filter.muscle) query = query.contains("primary_muscles", [filter.muscle]);

  const { data, error } = await query.order("name", { ascending: true }).limit(limit);
  if (error) throw new Error(`No se pudieron buscar ejercicios: ${error.message}`);
  return (data as ExerciseRow[]).map(exerciseFromRow);
}

export async function getExercise(supabase: SupabaseClient, id: string, userId: string): Promise<Exercise | null> {
  const { data, error } = await supabase
    .from("exercises")
    .select("*")
    .eq("id", id)
    .or(`user_id.is.null,user_id.eq.${userId}`)
    .maybeSingle();
  if (error) throw new Error(`No se pudo obtener el ejercicio: ${error.message}`);
  return data ? exerciseFromRow(data as ExerciseRow) : null;
}

export interface CustomExerciseInput {
  name: string;
  level: ExerciseLevel;
  category: ExerciseCategory;
  equipment: ExerciseEquipment | null;
  primaryMuscles: ExerciseMuscle[];
  instructions: string[];
}

export async function createCustomExercise(
  supabase: SupabaseClient,
  userId: string,
  input: CustomExerciseInput,
): Promise<Exercise> {
  const { data, error } = await supabase
    .from("exercises")
    .insert({
      id: `custom-${crypto.randomUUID()}`,
      user_id: userId,
      name: input.name,
      force: null,
      level: input.level,
      mechanic: null,
      equipment: input.equipment,
      primary_muscles: input.primaryMuscles,
      secondary_muscles: [],
      instructions: input.instructions,
      category: input.category,
    })
    .select("*")
    .single();
  if (error) throw new Error(`No se pudo crear el ejercicio personalizado: ${error.message}`);
  return exerciseFromRow(data as ExerciseRow);
}
