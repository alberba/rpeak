import { z } from "zod";
import { RangeSchema, RpeSchema, SetKindSchema, WeightSchema } from "./shared";

/** Objetivo planificado de una serie. min/max permiten rangos (p.ej. 8-12 reps). */
export const PlanSetSpecSchema = z
  .object({
    id: z.string().min(1),
    kind: SetKindSchema,
    reps: RangeSchema.nullable(),
    durationSec: RangeSchema.nullable(),
    weight: WeightSchema,
    targetRpe: RpeSchema.nullable(),
  })
  .refine((s) => (s.kind === "reps" ? s.reps !== null && s.durationSec === null : s.reps === null && s.durationSec !== null), {
    message: "Una serie de tipo 'reps' necesita reps y no durationSec; una de tipo 'time' necesita durationSec y no reps",
  });
export type PlanSetSpec = z.infer<typeof PlanSetSpecSchema>;

export const PlanExerciseSchema = z.object({
  id: z.string().min(1),
  exerciseId: z.string().min(1),
  notes: z.string().default(""),
  /** Descanso entre series de este ejercicio. Ignorado cuando forma parte de una superserie. */
  restBetweenSetsSec: z.number().int().nonnegative(),
  sets: z.array(PlanSetSpecSchema).min(1),
});
export type PlanExercise = z.infer<typeof PlanExerciseSchema>;

const PlanBlockSingleSchema = z.object({
  type: z.literal("single"),
  id: z.string().min(1),
  exercise: PlanExerciseSchema,
});

const PlanBlockSupersetSchema = z.object({
  type: z.literal("superset"),
  id: z.string().min(1),
  exercises: z.array(PlanExerciseSchema).min(2),
  /** Descanso al pasar de un ejercicio al siguiente dentro de la misma ronda. */
  restBetweenExercisesSec: z.number().int().nonnegative(),
  /** Descanso al completar una ronda completa de la superserie, antes de la siguiente. */
  restBetweenRoundsSec: z.number().int().nonnegative(),
});

export const PlanBlockSchema = z.discriminatedUnion("type", [PlanBlockSingleSchema, PlanBlockSupersetSchema]);
export type PlanBlock = z.infer<typeof PlanBlockSchema>;

export const PlanSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  name: z.string().min(1).max(120),
  description: z.string().max(2000).default(""),
  blocks: z.array(PlanBlockSchema),
  createdAt: z.string().datetime({ offset: true }),
  updatedAt: z.string().datetime({ offset: true }),
});
export type Plan = z.infer<typeof PlanSchema>;

export const PlanCreateInputSchema = PlanSchema.omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});
export type PlanCreateInput = z.infer<typeof PlanCreateInputSchema>;

export const PlanUpdateInputSchema = PlanCreateInputSchema.partial().extend({
  name: z.string().min(1).max(120).optional(),
});
export type PlanUpdateInput = z.infer<typeof PlanUpdateInputSchema>;

/** Devuelve todos los PlanExercise de un plan en orden de ejecución, con referencia a su bloque. */
export function flattenPlanExercises(plan: Pick<Plan, "blocks">): Array<{ block: PlanBlock; exercise: PlanExercise }> {
  const result: Array<{ block: PlanBlock; exercise: PlanExercise }> = [];
  for (const block of plan.blocks) {
    if (block.type === "single") {
      result.push({ block, exercise: block.exercise });
    } else {
      for (const exercise of block.exercises) {
        result.push({ block, exercise });
      }
    }
  }
  return result;
}
