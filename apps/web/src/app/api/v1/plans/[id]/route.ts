import { PlanUpdateInputSchema } from "@rpeak/domain";
import { NextResponse } from "next/server";
import { requireUser } from "@/server/auth";
import { ApiError, parseJsonBody, withRoute } from "@/server/api/http";
import { getRepositories } from "@/server/repositories";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export const GET = withRoute(async (_request: Request, { params }: RouteParams) => {
  const { id } = await params;
  const user = await requireUser();
  const { plans } = getRepositories();
  const plan = await plans.getById(id, user.id);
  if (!plan) throw new ApiError(404, "Plan no encontrado");
  return NextResponse.json(plan);
});

export const PATCH = withRoute(async (request: Request, { params }: RouteParams) => {
  const { id } = await params;
  const user = await requireUser();
  const input = await parseJsonBody(request, PlanUpdateInputSchema);
  const { plans } = getRepositories();
  const updated = await plans.update(id, user.id, input);
  if (!updated) throw new ApiError(404, "Plan no encontrado");
  return NextResponse.json(updated);
});

export const DELETE = withRoute(async (_request: Request, { params }: RouteParams) => {
  const { id } = await params;
  const user = await requireUser();
  const { plans } = getRepositories();
  const removed = await plans.remove(id, user.id);
  if (!removed) throw new ApiError(404, "Plan no encontrado");
  return new NextResponse(null, { status: 204 });
});
