"use server";

import { redirect } from "next/navigation";
import { buildFreeWorkout, buildWorkoutFromPlan } from "@rpeak/domain";
import { requireUser } from "@/lib/current-user";
import { getRepositories } from "@/server/repositories";

export async function startWorkoutFromPlanAction(planId: string): Promise<void> {
  const user = await requireUser();
  const { plans, workouts } = getRepositories();
  const plan = await plans.getById(planId, user.id);
  if (!plan) redirect("/planes");

  const input = buildWorkoutFromPlan(plan, () => crypto.randomUUID(), new Date().toISOString());
  const session = await workouts.create(user.id, input);
  redirect(`/entrenar/${session.id}`);
}

export async function startFreeWorkoutAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const { workouts } = getRepositories();
  const name = String(formData.get("name") || "").trim() || "Entrenamiento libre";

  const input = buildFreeWorkout(name, new Date().toISOString());
  const session = await workouts.create(user.id, input);
  redirect(`/entrenar/${session.id}`);
}
