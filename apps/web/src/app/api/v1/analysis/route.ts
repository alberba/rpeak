import { z } from "zod";
import { NextResponse } from "next/server";
import { requireUser } from "@/server/auth";
import { ApiError, parseJsonBody, withRoute } from "@/server/api/http";
import { getRepositories } from "@/server/repositories";
import { buildAnalysisRequest } from "@/server/build-analysis-request";
import { analyzeWorkout } from "@/server/openrouter";
import { getUserOpenRouterSettings } from "@/server/user-ai-settings";

export const dynamic = "force-dynamic";

const AnalysisRequestBodySchema = z.object({ workoutId: z.string().min(1) });

/** Analiza un entrenamiento con la clave personal de OpenRouter del usuario. */
export const POST = withRoute(async (request: Request) => {
  const user = await requireUser();
  const { workoutId } = await parseJsonBody(request, AnalysisRequestBodySchema);

  const { workouts, exercises } = getRepositories();
  const workout = await workouts.getById(workoutId, user.id);
  if (!workout) throw new ApiError(404, "Entrenamiento no encontrado");

  const settings = user.isDemo ? null : await getUserOpenRouterSettings(user.id);
  if (!settings) throw new ApiError(503, "Configura tu clave de OpenRouter antes de solicitar un análisis");

  const analysisRequest = await buildAnalysisRequest(workout, exercises);
  const result = await analyzeWorkout(analysisRequest, settings);
  return NextResponse.json(result);
});
