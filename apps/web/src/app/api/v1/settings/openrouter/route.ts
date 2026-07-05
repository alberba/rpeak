import { NextResponse } from "next/server";
import { z } from "zod";
import { ApiError, parseJsonBody, withRoute } from "@/server/api/http";
import { requireUser } from "@/server/auth";
import {
  deleteUserOpenRouterSettings,
  getUserOpenRouterSettingsSummary,
  saveUserOpenRouterSettings,
  updateUserOpenRouterModel,
} from "@/server/user-ai-settings";

export const dynamic = "force-dynamic";

const ApiKeySchema = z.string().trim().min(20).max(300).refine((value) => value.startsWith("sk-or-"), "La clave no parece ser de OpenRouter");
const ModelSchema = z.string().trim().min(1).max(160).regex(/^[a-zA-Z0-9._:/-]+$/, "El identificador del modelo no es válido");

const SettingsSchema = z.object({
  apiKey: z.union([ApiKeySchema, z.literal("")]).optional(),
  model: ModelSchema,
});

export const GET = withRoute(async () => {
  const user = await requireUser();
  if (user.isDemo) return NextResponse.json({ configured: false, keyHint: null, model: "openrouter/free" });
  return NextResponse.json(await getUserOpenRouterSettingsSummary(user.id));
});

export const PUT = withRoute(async (request: Request) => {
  const user = await requireUser();
  if (user.isDemo) throw new ApiError(400, "Inicia sesión para guardar una clave personal");
  const input = await parseJsonBody(request, SettingsSchema);
  if (input.apiKey) {
    await saveUserOpenRouterSettings(user.id, input.apiKey, input.model);
    return NextResponse.json({ configured: true, keyHint: input.apiKey.slice(-6), model: input.model });
  }

  return NextResponse.json(await updateUserOpenRouterModel(user.id, input.model));
});

export const DELETE = withRoute(async () => {
  const user = await requireUser();
  if (user.isDemo) throw new ApiError(400, "No hay una clave personal en el modo demo");
  await deleteUserOpenRouterSettings(user.id);
  return new NextResponse(null, { status: 204 });
});
