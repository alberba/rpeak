import type { AnalysisRepository, WorkoutAnalysisCreateInput, WorkoutAnalysisRecord } from "@rpeak/domain";
import { workoutAnalysisFromRow, type WorkoutAnalysisRow } from "./mappers";
import { getSupabaseServerClient } from "./server-client";

export class SupabaseAnalysisRepository implements AnalysisRepository {
  async getByWorkoutId(workoutId: string, userId: string): Promise<WorkoutAnalysisRecord | null> {
    const supabase = await getSupabaseServerClient();
    const { data, error } = await supabase
      .from("workout_analyses")
      .select("*")
      .eq("workout_id", workoutId)
      .eq("user_id", userId)
      .maybeSingle();
    if (error) throw new Error(`No se pudo obtener el análisis: ${error.message}`);
    if (!data) return null;
    return workoutAnalysisFromRow(data as WorkoutAnalysisRow);
  }

  async upsert(userId: string, input: WorkoutAnalysisCreateInput): Promise<WorkoutAnalysisRecord> {
    const supabase = await getSupabaseServerClient();
    const { data, error } = await supabase
      .from("workout_analyses")
      .upsert(
        {
          workout_id: input.workoutId,
          user_id: userId,
          model: input.model,
          summary: input.summary,
          highlights: input.highlights,
          suggestions: input.suggestions,
          risk_flags: input.riskFlags,
          created_at: new Date().toISOString(),
        },
        { onConflict: "workout_id" },
      )
      .select("*")
      .single();
    if (error) throw new Error(`No se pudo guardar el análisis: ${error.message}`);
    return workoutAnalysisFromRow(data as WorkoutAnalysisRow);
  }
}
