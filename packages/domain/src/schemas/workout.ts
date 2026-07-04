import { z } from "zod";
import { IsoTimestampSchema, RangeSchema, RpeSchema, SetKindSchema, WeightSchema } from "./shared";

/**
 * Serie ejecutada. target* proviene del plan (o null si el entrenamiento es libre);
 * actual* y las marcas de tiempo reales se rellenan durante la ejecución para
 * poder automatizar el temporizador de descanso.
 */
export const WorkoutSetSchema = z.object({
  id: z.string().min(1),
  planSetId: z.string().min(1).nullable(),
  kind: SetKindSchema,
  targetReps: RangeSchema.nullable(),
  targetDurationSec: RangeSchema.nullable(),
  weight: WeightSchema,
  actualReps: z.number().int().nonnegative().nullable(),
  actualDurationSec: z.number().int().nonnegative().nullable(),
  rpe: RpeSchema.nullable(),
  completed: z.boolean(),
  startedAt: IsoTimestampSchema.nullable(),
  completedAt: IsoTimestampSchema.nullable(),
});
export type WorkoutSet = z.infer<typeof WorkoutSetSchema>;

export const WorkoutExerciseSchema = z.object({
  id: z.string().min(1),
  planExerciseId: z.string().min(1).nullable(),
  exerciseId: z.string().min(1),
  notes: z.string().default(""),
  restBetweenSetsSec: z.number().int().nonnegative(),
  sets: z.array(WorkoutSetSchema),
});
export type WorkoutExercise = z.infer<typeof WorkoutExerciseSchema>;

const WorkoutBlockSingleSchema = z.object({
  type: z.literal("single"),
  id: z.string().min(1),
  exercise: WorkoutExerciseSchema,
});

const WorkoutBlockSupersetSchema = z.object({
  type: z.literal("superset"),
  id: z.string().min(1),
  exercises: z.array(WorkoutExerciseSchema).min(2),
  restBetweenExercisesSec: z.number().int().nonnegative(),
  restBetweenRoundsSec: z.number().int().nonnegative(),
});

export const WorkoutBlockSchema = z.discriminatedUnion("type", [WorkoutBlockSingleSchema, WorkoutBlockSupersetSchema]);
export type WorkoutBlock = z.infer<typeof WorkoutBlockSchema>;

export const WorkoutSessionSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  planId: z.string().min(1).nullable(),
  name: z.string().min(1).max(120),
  notes: z.string().max(2000).default(""),
  blocks: z.array(WorkoutBlockSchema),
  startedAt: IsoTimestampSchema,
  finishedAt: IsoTimestampSchema.nullable(),
});
export type WorkoutSession = z.infer<typeof WorkoutSessionSchema>;

export const WorkoutCreateInputSchema = WorkoutSessionSchema.omit({
  id: true,
  userId: true,
});
export type WorkoutCreateInput = z.infer<typeof WorkoutCreateInputSchema>;

export const WorkoutUpdateInputSchema = WorkoutCreateInputSchema.partial();
export type WorkoutUpdateInput = z.infer<typeof WorkoutUpdateInputSchema>;

export const WorkoutFilterSchema = z.object({
  planId: z.string().min(1).optional(),
  from: IsoTimestampSchema.optional(),
  to: IsoTimestampSchema.optional(),
  limit: z.number().int().positive().max(200).default(50),
});
export type WorkoutFilter = z.infer<typeof WorkoutFilterSchema>;

export function flattenWorkoutExercises(
  session: Pick<WorkoutSession, "blocks">,
): Array<{ block: WorkoutBlock; exercise: WorkoutExercise }> {
  const result: Array<{ block: WorkoutBlock; exercise: WorkoutExercise }> = [];
  for (const block of session.blocks) {
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
