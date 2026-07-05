import { z } from "zod";

/** Entrada resumida de un entrenamiento para pedir análisis a un LLM. */
export const WorkoutAnalysisRequestSchema = z.object({
  workoutId: z.string().min(1),
  workoutName: z.string(),
  startedAt: z.string(),
  finishedAt: z.string().nullable(),
  exercises: z.array(
    z.object({
      name: z.string(),
      sets: z.array(
        z.object({
          kind: z.enum(["reps", "time"]),
          weight: z.number(),
          actualReps: z.number().nullable(),
          actualDurationSec: z.number().nullable(),
          rpe: z.number().nullable(),
          completed: z.boolean(),
        }),
      ),
    }),
  ),
  notes: z.string().optional(),
});
export type WorkoutAnalysisRequest = z.infer<typeof WorkoutAnalysisRequestSchema>;

/** Salida estructurada que debe devolver el modelo, validada antes de mostrarse. */
export const WorkoutAnalysisResultSchema = z.object({
  summary: z.string().min(1),
  highlights: z.array(z.string()).default([]),
  suggestions: z.array(z.string()).default([]),
  riskFlags: z.array(z.string()).default([]),
});
export type WorkoutAnalysisResult = z.infer<typeof WorkoutAnalysisResultSchema>;

/** Estado de disponibilidad del análisis por IA (depende de configuración de entorno). */
export const AnalysisAvailabilitySchema = z.object({
  available: z.boolean(),
  reason: z.string().nullable(),
  model: z.string().nullable(),
});
export type AnalysisAvailability = z.infer<typeof AnalysisAvailabilitySchema>;

/** Análisis de IA ya persistido en base de datos, asociado a un entrenamiento concreto. */
export const WorkoutAnalysisRecordSchema = WorkoutAnalysisResultSchema.extend({
  id: z.string().min(1),
  workoutId: z.string().min(1),
  userId: z.string().min(1),
  model: z.string().min(1),
  createdAt: z.string(),
});
export type WorkoutAnalysisRecord = z.infer<typeof WorkoutAnalysisRecordSchema>;

export const WorkoutAnalysisCreateInputSchema = WorkoutAnalysisResultSchema.extend({
  workoutId: z.string().min(1),
  model: z.string().min(1),
});
export type WorkoutAnalysisCreateInput = z.infer<typeof WorkoutAnalysisCreateInputSchema>;
