"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { PlanCreateInput, PlanUpdateInput } from "@rpeak/domain";
import { requireUser } from "@/lib/current-user";
import { getRepositories } from "@/server/repositories";

export async function createPlanAction(input: PlanCreateInput): Promise<void> {
  const user = await requireUser();
  const { plans } = getRepositories();
  const plan = await plans.create(user.id, input);
  revalidatePath("/planes");
  redirect(`/planes/${plan.id}`);
}

export async function updatePlanAction(planId: string, input: PlanUpdateInput): Promise<void> {
  const user = await requireUser();
  const { plans } = getRepositories();
  await plans.update(planId, user.id, input);
  revalidatePath("/planes");
  revalidatePath(`/planes/${planId}`);
}

export async function deletePlanAction(planId: string): Promise<void> {
  const user = await requireUser();
  const { plans } = getRepositories();
  await plans.remove(planId, user.id);
  revalidatePath("/planes");
  redirect("/planes");
}
