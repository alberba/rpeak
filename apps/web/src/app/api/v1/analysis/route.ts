import { z } from "zod";
import { NextResponse } from "next/server";
import { requireUser } from "@/server/auth";
import { ApiError, parseJsonBody, withRoute } from "@/server/api/http";
import { getRepositories } from "@/server/repositories";
import { buildAnalysisRequest } from "@/server/build-analysis-request";
import { analyzeWorkout } from "@/server/openrouter";

export const dynamic = "force-dynamic";

const AnalysisRequestBodySchema = z.object({ workoutId: z.string().min(1) });

/** Analiza un entrenamiento ya registrado con el modelo configurado en OPENROUTER_MODEL. */
export const POST = withRoute(async (request: Request) => {
  const user = await requireUser();
  const { workoutId } = await parseJsonBody(request, AnalysisRequestBodySchema);

  const { workouts, exercises } = getRepositories();
  const workout = await workouts.getById(workoutId, user.id);
  if (!workout) throw new ApiError(404, "Entrenamiento no encontrado");

  const analysisRequest = await buildAnalysisRequest(workout, exercises);
  const result = await analyzeWorkout(analysisRequest);
  return NextResponse.json(result);
});
