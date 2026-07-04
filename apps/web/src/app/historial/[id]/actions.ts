"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/current-user";
import { getRepositories } from "@/server/repositories";

export async function updateWorkoutNotesAction(workoutId: string, notes: string): Promise<void> {
  const user = await requireUser();
  const { workouts } = getRepositories();
  await workouts.update(workoutId, user.id, { notes });
  revalidatePath(`/historial/${workoutId}`);
}

export async function deleteWorkoutAction(workoutId: string): Promise<void> {
  const user = await requireUser();
  const { workouts } = getRepositories();
  await workouts.remove(workoutId, user.id);
  revalidatePath("/historial");
  redirect("/historial");
}
