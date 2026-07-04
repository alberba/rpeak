import { PlanCreateInputSchema } from "@rpeak/domain";
import { NextResponse } from "next/server";
import { requireUser } from "@/server/auth";
import { parseJsonBody, withRoute } from "@/server/api/http";
import { getRepositories } from "@/server/repositories";

export const dynamic = "force-dynamic";

export const GET = withRoute(async () => {
  const user = await requireUser();
  const { plans } = getRepositories();
  const list = await plans.list(user.id);
  return NextResponse.json(list);
});

export const POST = withRoute(async (request: Request) => {
  const user = await requireUser();
  const input = await parseJsonBody(request, PlanCreateInputSchema);
  const { plans } = getRepositories();
  const created = await plans.create(user.id, input);
  return NextResponse.json(created, { status: 201 });
});
