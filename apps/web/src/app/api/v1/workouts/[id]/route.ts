import { NextResponse } from "next/server";
import { requireUser } from "@/server/auth";
import { ApiError, withRoute } from "@/server/api/http";
import { getRepositories } from "@/server/repositories";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export const GET = withRoute(async (_request: Request, { params }: RouteParams) => {
  const { id } = await params;
  const user = await requireUser();
  const { workouts } = getRepositories();
  const workout = await workouts.getById(id, user.id);
  if (!workout) throw new ApiError(404, "Entrenamiento no encontrado");
  return NextResponse.json(workout);
});
