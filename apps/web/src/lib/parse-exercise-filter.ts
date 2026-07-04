import { ExerciseFilterSchema, type ExerciseFilter } from "@rpeak/domain";

type RawParams = Record<string, string | string[] | undefined>;

function single(value: string | string[] | undefined): string | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw && raw.trim().length > 0 ? raw : undefined;
}

/** Convierte los searchParams de la URL en un ExerciseFilter válido, ignorando valores desconocidos. */
export function parseExerciseFilter(params: RawParams): ExerciseFilter {
  const candidate = {
    query: single(params.q),
    category: single(params.category),
    equipment: single(params.equipment),
    muscle: single(params.muscle),
    level: single(params.level),
  };
  const result = ExerciseFilterSchema.safeParse(candidate);
  return result.success ? result.data : {};
}
