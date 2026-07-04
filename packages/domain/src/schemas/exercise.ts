import { z } from "zod";

export const ExerciseForceSchema = z.enum(["push", "pull", "static"]);
export type ExerciseForce = z.infer<typeof ExerciseForceSchema>;

export const ExerciseLevelSchema = z.enum(["beginner", "intermediate", "expert"]);
export type ExerciseLevel = z.infer<typeof ExerciseLevelSchema>;

export const ExerciseMechanicSchema = z.enum(["compound", "isolation"]);
export type ExerciseMechanic = z.infer<typeof ExerciseMechanicSchema>;

export const ExerciseCategorySchema = z.enum([
  "strength",
  "stretching",
  "plyometrics",
  "powerlifting",
  "olympic weightlifting",
  "strongman",
  "cardio",
]);
export type ExerciseCategory = z.infer<typeof ExerciseCategorySchema>;

export const ExerciseEquipmentSchema = z.enum([
  "barbell",
  "dumbbell",
  "other",
  "body only",
  "cable",
  "machine",
  "kettlebells",
  "bands",
  "medicine ball",
  "exercise ball",
  "foam roll",
  "e-z curl bar",
]);
export type ExerciseEquipment = z.infer<typeof ExerciseEquipmentSchema>;

export const ExerciseMuscleSchema = z.enum([
  "abdominals",
  "abductors",
  "adductors",
  "biceps",
  "calves",
  "chest",
  "forearms",
  "glutes",
  "hamstrings",
  "lats",
  "lower back",
  "middle back",
  "neck",
  "quadriceps",
  "shoulders",
  "traps",
  "triceps",
]);
export type ExerciseMuscle = z.infer<typeof ExerciseMuscleSchema>;

export const ExerciseSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  force: ExerciseForceSchema.nullable(),
  level: ExerciseLevelSchema,
  mechanic: ExerciseMechanicSchema.nullable(),
  equipment: ExerciseEquipmentSchema.nullable(),
  primaryMuscles: z.array(ExerciseMuscleSchema),
  secondaryMuscles: z.array(ExerciseMuscleSchema),
  instructions: z.array(z.string()),
  category: ExerciseCategorySchema,
});
export type Exercise = z.infer<typeof ExerciseSchema>;

export const ExerciseFilterSchema = z.object({
  query: z.string().trim().min(1).optional(),
  category: ExerciseCategorySchema.optional(),
  equipment: ExerciseEquipmentSchema.optional(),
  muscle: ExerciseMuscleSchema.optional(),
  level: ExerciseLevelSchema.optional(),
});
export type ExerciseFilter = z.infer<typeof ExerciseFilterSchema>;
