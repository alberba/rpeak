import {
  buildWorkoutAnalysisPrompt,
  WorkoutAnalysisResultSchema,
  type WorkoutAnalysisRequest,
  type WorkoutAnalysisResult,
} from "@rpeak/domain";
import { ApiError } from "@/server/api/http";

const DEFAULT_BASE_URL = "https://openrouter.ai/api/v1";

export interface OpenRouterConfig {
  apiKey: string;
  model: string;
}

function expandConfig(settings: OpenRouterConfig) {
  return {
    ...settings,
    baseUrl: process.env.OPENROUTER_BASE_URL?.trim() || DEFAULT_BASE_URL,
    siteUrl: process.env.OPENROUTER_SITE_URL?.trim() || null,
    appName: process.env.OPENROUTER_APP_NAME?.trim() || "RPeak",
  };
}

/** Quita el envoltorio de bloque de código markdown que algunos modelos añaden pese a que se les pide JSON puro. */
function stripCodeFence(content: string): string {
  const trimmed = content.trim();
  const fenceMatch = /^```(?:json)?\s*([\s\S]*?)\s*```$/i.exec(trimmed);
  return fenceMatch ? fenceMatch[1]! : trimmed;
}

/** Parsea y valida la respuesta del modelo. Exportada aparte para poder testearla sin red. */
export function parseAnalysisContent(content: string): WorkoutAnalysisResult {
  let raw: unknown;
  try {
    raw = JSON.parse(stripCodeFence(content));
  } catch {
    throw new ApiError(502, "El análisis del modelo no es JSON válido");
  }
  const result = WorkoutAnalysisResultSchema.safeParse(raw);
  if (!result.success) {
    throw new ApiError(502, "El análisis del modelo no tiene el formato esperado", result.error.flatten());
  }
  return result.data;
}

interface OpenRouterChatResponse {
  choices?: Array<{ message?: { content?: string } }>;
}

/** Pide a OpenRouter un análisis del entrenamiento y devuelve el resultado ya validado. */
export async function analyzeWorkout(
  request: WorkoutAnalysisRequest,
  settings: OpenRouterConfig,
): Promise<WorkoutAnalysisResult> {
  const config = expandConfig(settings);

  const { system, user } = buildWorkoutAnalysisPrompt(request);

  const headers: Record<string, string> = {
    Authorization: `Bearer ${config.apiKey}`,
    "Content-Type": "application/json",
  };
  if (config.siteUrl) headers["HTTP-Referer"] = config.siteUrl;
  if (config.appName) headers["X-Title"] = config.appName;

  let response: Response;
  try {
    response = await fetch(`${config.baseUrl}/chat/completions`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: config.model,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });
  } catch (err) {
    throw new ApiError(502, `No se pudo contactar con OpenRouter: ${err instanceof Error ? err.message : String(err)}`);
  }

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new ApiError(502, `OpenRouter devolvió un error (${response.status})`, body.slice(0, 500));
  }

  const payload = (await response.json()) as OpenRouterChatResponse;
  const content = payload.choices?.[0]?.message?.content;
  if (!content) {
    throw new ApiError(502, "OpenRouter no devolvió contenido en la respuesta");
  }

  return parseAnalysisContent(content);
}
