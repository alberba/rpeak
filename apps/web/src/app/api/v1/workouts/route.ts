import { WorkoutFilterSchema } from "@rpeak/domain";
import { NextResponse } from "next/server";
import { requireUser } from "@/server/auth";
import { withRoute } from "@/server/api/http";
import { getRepositories } from "@/server/repositories";

export const dynamic = "force-dynamic";

/** Solo lectura: el registro de entrenamientos se crea/edita desde la app en vivo, no vía API v1. */
export const GET = withRoute(async (request: Request) => {
  const user = await requireUser();
  const url = new URL(request.url);
  const rawLimit = url.searchParams.get("limit");

  const filter = WorkoutFilterSchema.parse({
    planId: url.searchParams.get("planId") ?? undefined,
    from: url.searchParams.get("from") ?? undefined,
    to: url.searchParams.get("to") ?? undefined,
    limit: rawLimit !== null ? Number(rawLimit) : undefined,
  });

  const { workouts } = getRepositories();
  const list = await workouts.list(user.id, filter);
  return NextResponse.json(list);
});
