"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { PlanBlock, WorkoutBlock } from "@rpeak/domain";
import { requireUser } from "@/lib/current-user";
import { getRepositories } from "@/server/repositories";

export interface ExerciseSwap {
  planExerciseId: string;
  exerciseId: string;
}

export async function applyExerciseSwapsAction(planId: string, swaps: ExerciseSwap[]): Promise<void> {
  const user = await requireUser();
  const { plans } = getRepositories();
  const plan = await plans.getById(planId, user.id);
  if (!plan) return;

  const swapMap = new Map(swaps.map((s) => [s.planExerciseId, s.exerciseId]));
  const blocks: PlanBlock[] = plan.blocks.map((block) => {
    if (block.type === "single") {
      const newExerciseId = swapMap.get(block.exercise.id);
      return newExerciseId ? { ...block, exercise: { ...block.exercise, exerciseId: newExerciseId } } : block;
    }
    return {
      ...block,
      exercises: block.exercises.map((exercise) => {
        const newExerciseId = swapMap.get(exercise.id);
        return newExerciseId ? { ...exercise, exerciseId: newExerciseId } : exercise;
      }),
    };
  });

  await plans.update(planId, user.id, { blocks });
  revalidatePath(`/planes/${planId}`);
}

export async function saveWorkoutBlocksAction(workoutId: string, blocks: WorkoutBlock[]): Promise<void> {
  const user = await requireUser();
  const { workouts } = getRepositories();
  await workouts.update(workoutId, user.id, { blocks });
  revalidatePath(`/entrenar/${workoutId}`);
}

export async function updateWorkoutNotesAction(workoutId: string, notes: string): Promise<void> {
  const user = await requireUser();
  const { workouts } = getRepositories();
  await workouts.update(workoutId, user.id, { notes });
}

/**
 * `pausedMs` es el tiempo total que el entrenamiento estuvo en pausa (llevado en el
 * cliente). Se descuenta desplazando `startedAt` hacia delante para que la duración
 * calculada en el historial (finishedAt - startedAt) coincida con el tiempo activo
 * mostrado durante el entrenamiento.
 */
export async function finishWorkoutAction(workoutId: string, pausedMs = 0): Promise<void> {
  const user = await requireUser();
  const { workouts } = getRepositories();
  const session = await workouts.getById(workoutId, user.id);
  if (!session) return;

  const finishedAt = new Date();
  const startedAt = pausedMs > 0 ? new Date(new Date(session.startedAt).getTime() + pausedMs) : null;

  await workouts.update(workoutId, user.id, {
    finishedAt: finishedAt.toISOString(),
    ...(startedAt ? { startedAt: startedAt.toISOString() } : {}),
  });
  revalidatePath("/historial");
  revalidatePath("/");
  redirect(`/historial/${workoutId}`);
}
