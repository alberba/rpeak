import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  ExerciseCategorySchema,
  ExerciseEquipmentSchema,
  ExerciseFilterSchema,
  ExerciseLevelSchema,
  ExerciseMuscleSchema,
} from "@rpeak/domain";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { createCustomExercise, getExercise, searchExercises } from "../repositories/exercises";

const SearchInputSchema = ExerciseFilterSchema.extend({
  limit: z.number().int().min(1).max(50).default(20),
});
const GetInputSchema = z.object({ id: z.string().min(1) });
const CreateCustomInputSchema = z.object({
  name: z.string().trim().min(1).max(120),
  level: ExerciseLevelSchema.default("beginner"),
  category: ExerciseCategorySchema.default("strength"),
  equipment: ExerciseEquipmentSchema.nullable().default(null),
  primaryMuscles: z.array(ExerciseMuscleSchema).min(1),
  instructions: z.array(z.string().trim().min(1)).default([]),
});

function textResult(value: unknown, isError = false): CallToolResult {
  return { content: [{ type: "text", text: JSON.stringify(value, null, 2) }], isError };
}

export function registerExerciseTools(server: McpServer, supabase: SupabaseClient, userId: string): void {
  server.registerTool(
    "exercises_search",
    {
      title: "Buscar ejercicios",
      description:
        "Busca ejercicios del catálogo oficial de RPeak, cuyos nombres están en inglés. Traduce al inglés cualquier ejercicio pedido en español antes de buscar. Reutiliza exactamente los IDs encontrados en exerciseId. Si no hay equivalente tras buscar en inglés, pregunta al usuario si desea uno personalizado.",
      inputSchema: SearchInputSchema,
    },
    async ({ limit, ...filter }) => textResult(await searchExercises(supabase, filter, limit, userId)),
  );

  server.registerTool(
    "exercises_get",
    {
      title: "Obtener ejercicio",
      description: "Obtiene los detalles de un ejercicio existente del catálogo por su ID canónico.",
      inputSchema: GetInputSchema,
    },
    async ({ id }) => {
      const exercise = await getExercise(supabase, id, userId);
      return exercise ? textResult(exercise) : textResult({ error: `Ejercicio ${id} no encontrado` }, true);
    },
  );

  server.registerTool(
    "exercises_create_custom",
    {
      title: "Crear ejercicio personalizado",
      description:
        "Crea un ejercicio privado para el usuario. Úsalo únicamente después de buscar su equivalente en inglés con exercises_search y de que el usuario confirme expresamente que desea crear uno personalizado.",
      inputSchema: CreateCustomInputSchema,
    },
    async (input) => textResult(await createCustomExercise(supabase, userId, input)),
  );
}
