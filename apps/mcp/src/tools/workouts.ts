import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import { WorkoutFilterSchema } from "@rpeak/domain";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { getWorkout, listWorkouts } from "../repositories/workouts";

const IdInputSchema = z.object({ id: z.string().min(1) });

function textResult(value: unknown, isError = false): CallToolResult {
  return { content: [{ type: "text", text: JSON.stringify(value, null, 2) }], isError };
}

/** Solo lectura: el MCP expone el historial de entrenamientos, no su edición. */
export function registerWorkoutTools(server: McpServer, supabase: SupabaseClient, userId: string): void {
  server.registerTool(
    "workouts_list",
    {
      title: "Listar entrenamientos",
      description: "Lista el historial de entrenamientos del usuario, opcionalmente filtrado por plan o rango de fechas.",
      inputSchema: WorkoutFilterSchema,
    },
    async (filter) => textResult(await listWorkouts(supabase, userId, filter)),
  );

  server.registerTool(
    "workouts_get",
    { title: "Obtener entrenamiento", description: "Obtiene un entrenamiento por id.", inputSchema: IdInputSchema },
    async ({ id }) => {
      const workout = await getWorkout(supabase, userId, id);
      if (!workout) return textResult({ error: `Entrenamiento ${id} no encontrado` }, true);
      return textResult(workout);
    },
  );
}
