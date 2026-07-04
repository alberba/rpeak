import type { SupabaseClient } from "@supabase/supabase-js";
import type { Plan, PlanCreateInput, PlanUpdateInput } from "@rpeak/domain";
import { planFromRow, type PlanRow } from "../mappers";

export async function listPlans(supabase: SupabaseClient, userId: string): Promise<Plan[]> {
  const { data, error } = await supabase
    .from("plans")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(`No se pudieron listar los planes: ${error.message}`);
  return (data as PlanRow[]).map(planFromRow);
}

export async function getPlan(supabase: SupabaseClient, userId: string, id: string): Promise<Plan | null> {
  const { data, error } = await supabase.from("plans").select("*").eq("id", id).eq("user_id", userId).maybeSingle();
  if (error) throw new Error(`No se pudo obtener el plan: ${error.message}`);
  return data ? planFromRow(data as PlanRow) : null;
}

export async function createPlan(supabase: SupabaseClient, userId: string, input: PlanCreateInput): Promise<Plan> {
  const { data, error } = await supabase
    .from("plans")
    .insert({ user_id: userId, name: input.name, description: input.description, blocks: input.blocks })
    .select("*")
    .single();
  if (error) throw new Error(`No se pudo crear el plan: ${error.message}`);
  return planFromRow(data as PlanRow);
}

export async function updatePlan(supabase: SupabaseClient, userId: string, id: string, input: PlanUpdateInput): Promise<Plan | null> {
  const patch: Record<string, unknown> = {};
  if (input.name !== undefined) patch.name = input.name;
  if (input.description !== undefined) patch.description = input.description;
  if (input.blocks !== undefined) patch.blocks = input.blocks;

  const { data, error } = await supabase.from("plans").update(patch).eq("id", id).eq("user_id", userId).select("*").maybeSingle();
  if (error) throw new Error(`No se pudo actualizar el plan: ${error.message}`);
  return data ? planFromRow(data as PlanRow) : null;
}

export async function deletePlan(supabase: SupabaseClient, userId: string, id: string): Promise<boolean> {
  const { data, error } = await supabase.from("plans").delete().eq("id", id).eq("user_id", userId).select("id").maybeSingle();
  if (error) throw new Error(`No se pudo eliminar el plan: ${error.message}`);
  return data !== null;
}
