import type { Plan, PlanCreateInput, PlanRepository, PlanUpdateInput } from "@rpeak/domain";
import { planFromRow, type PlanRow } from "./mappers";
import { getSupabaseServerClient } from "./server-client";

/**
 * Implementación real contra Supabase Postgres + RLS. RLS ya limita cada fila a su
 * dueño (user_id = auth.uid()), pero filtramos también por userId aquí como segunda
 * barrera explícita: si algún día la política de RLS se relaja por error, esta capa
 * sigue sin filtrar datos de otro usuario.
 */
export class SupabasePlanRepository implements PlanRepository {
  async list(userId: string): Promise<Plan[]> {
    const supabase = await getSupabaseServerClient();
    const { data, error } = await supabase
      .from("plans")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(`No se pudieron listar los planes: ${error.message}`);
    return (data as PlanRow[]).map(planFromRow);
  }

  async getById(id: string, userId: string): Promise<Plan | null> {
    const supabase = await getSupabaseServerClient();
    const { data, error } = await supabase.from("plans").select("*").eq("id", id).eq("user_id", userId).maybeSingle();
    if (error) throw new Error(`No se pudo obtener el plan: ${error.message}`);
    if (!data) return null;
    return planFromRow(data as PlanRow);
  }

  async create(userId: string, input: PlanCreateInput): Promise<Plan> {
    const supabase = await getSupabaseServerClient();
    const { data, error } = await supabase
      .from("plans")
      .insert({
        user_id: userId,
        name: input.name,
        description: input.description,
        blocks: input.blocks,
      })
      .select("*")
      .single();
    if (error) throw new Error(`No se pudo crear el plan: ${error.message}`);
    return planFromRow(data as PlanRow);
  }

  async update(id: string, userId: string, input: PlanUpdateInput): Promise<Plan | null> {
    const supabase = await getSupabaseServerClient();
    const patch: Record<string, unknown> = {};
    if (input.name !== undefined) patch.name = input.name;
    if (input.description !== undefined) patch.description = input.description;
    if (input.blocks !== undefined) patch.blocks = input.blocks;

    const { data, error } = await supabase
      .from("plans")
      .update(patch)
      .eq("id", id)
      .eq("user_id", userId)
      .select("*")
      .maybeSingle();
    if (error) throw new Error(`No se pudo actualizar el plan: ${error.message}`);
    if (!data) return null;
    return planFromRow(data as PlanRow);
  }

  async remove(id: string, userId: string): Promise<boolean> {
    const supabase = await getSupabaseServerClient();
    const { data, error } = await supabase.from("plans").delete().eq("id", id).eq("user_id", userId).select("id").maybeSingle();
    if (error) throw new Error(`No se pudo eliminar el plan: ${error.message}`);
    return data !== null;
  }
}
