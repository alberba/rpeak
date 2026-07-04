import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import { PlanCreateInputSchema, PlanUpdateInputSchema } from "@rpeak/domain";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { createPlan, deletePlan, getPlan, listPlans, updatePlan } from "../repositories/plans";

const IdInputSchema = z.object({ id: z.string().min(1) });
const UpdateInputSchema = PlanUpdateInputSchema.extend({ id: z.string().min(1) });

function textResult(value: unknown, isError = false): CallToolResult {
  return { content: [{ type: "text", text: JSON.stringify(value, null, 2) }], isError };
}

export function registerPlanTools(server: McpServer, supabase: SupabaseClient, userId: string): void {
  server.registerTool(
    "plans_list",
    {
      title: "Listar planes",
      description: "Lista todos los planes de entrenamiento del usuario autenticado.",
    },
    async () => textResult(await listPlans(supabase, userId)),
  );

  server.registerTool(
    "plans_get",
    { title: "Obtener plan", description: "Obtiene un plan por id.", inputSchema: IdInputSchema },
    async ({ id }) => {
      const plan = await getPlan(supabase, userId, id);
      if (!plan) return textResult({ error: `Plan ${id} no encontrado` }, true);
      return textResult(plan);
    },
  );

  server.registerTool(
    "plans_create",
    {
      title: "Crear plan",
      description:
        "Crea un plan. Busca primero los ejercicios del catálogo con exercises_search, traduciendo al inglés los nombres solicitados. Si no existe un equivalente, pregunta al usuario y, solo si confirma, créalo con exercises_create_custom antes de usar el ID devuelto.",
      inputSchema: PlanCreateInputSchema,
    },
    async (input) => textResult(await createPlan(supabase, userId, input)),
  );

  server.registerTool(
    "plans_update",
    {
      title: "Actualizar plan",
      description:
        "Actualiza un plan. Busca los ejercicios en inglés con exercises_search; si no existen, solicita confirmación antes de usar personalizados.",
      inputSchema: UpdateInputSchema,
    },
    async ({ id, ...input }) => {
      const updated = await updatePlan(supabase, userId, id, input);
      if (!updated) return textResult({ error: `Plan ${id} no encontrado` }, true);
      return textResult(updated);
    },
  );

  server.registerTool(
    "plans_delete",
    { title: "Eliminar plan", description: "Elimina un plan por id.", inputSchema: IdInputSchema },
    async ({ id }) => {
      const deleted = await deletePlan(supabase, userId, id);
      if (!deleted) return textResult({ error: `Plan ${id} no encontrado` }, true);
      return textResult({ deleted: true, id });
    },
  );
}
