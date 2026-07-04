import { z } from "zod";

/** Rango inclusivo. Al planificar, min === max es válido (objetivo fijo). */
export const RangeSchema = z
  .object({
    min: z.number().int().nonnegative(),
    max: z.number().int().nonnegative(),
  })
  .refine((r) => r.max >= r.min, {
    message: "El máximo del rango debe ser mayor o igual que el mínimo",
  });
export type Range = z.infer<typeof RangeSchema>;

/** RPE (Rate of Perceived Exertion), escala 1-10 con incrementos de 0.5. */
export const RpeSchema = z
  .number()
  .min(1)
  .max(10)
  .multipleOf(0.5);
export type Rpe = z.infer<typeof RpeSchema>;

/** Peso en kilogramos. 0 representa peso corporal. */
export const WeightSchema = z.number().nonnegative();

export const SetKindSchema = z.enum(["reps", "time"]);
export type SetKind = z.infer<typeof SetKindSchema>;

export const IsoTimestampSchema = z.string().datetime({ offset: true });
