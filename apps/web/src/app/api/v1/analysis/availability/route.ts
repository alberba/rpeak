import { NextResponse } from "next/server";
import { withRoute } from "@/server/api/http";
import { getAnalysisAvailability } from "@/server/openrouter";

export const dynamic = "force-dynamic";

export const GET = withRoute(async () => {
  return NextResponse.json(getAnalysisAvailability());
});
