"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { WorkoutBlock } from "@rpeak/domain";
import { requireUser } from "@/lib/current-user";
import { getRepositories } from "@/server/repositories";

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

export async function finishWorkoutAction(workoutId: string): Promise<void> {
  const user = await requireUser();
  const { workouts } = getRepositories();
  await workouts.update(workoutId, user.id, { finishedAt: new Date().toISOString() });
  revalidatePath("/historial");
  revalidatePath("/");
  redirect(`/historial/${workoutId}`);
}
