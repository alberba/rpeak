import { NextResponse } from "next/server";
import { withRoute } from "@/server/api/http";
import { requireUser } from "@/server/auth";
import { getUserOpenRouterSettingsSummary } from "@/server/user-ai-settings";

export const dynamic = "force-dynamic";

export const GET = withRoute(async () => {
  const user = await requireUser();
  const summary = user.isDemo
    ? { configured: false, model: "openrouter/free" }
    : await getUserOpenRouterSettingsSummary(user.id);
  return NextResponse.json(
    summary.configured
      ? { available: true, reason: null, model: summary.model }
      : { available: false, reason: "Configura tu clave personal de OpenRouter", model: null },
  );
});
