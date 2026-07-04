import { NextResponse } from "next/server";
import { buildResourceMetadata } from "@/server/oauth";

export async function GET() {
  return NextResponse.json(buildResourceMetadata(), {
    headers: { "cache-control": "no-store" },
  });
}
