import { NextResponse } from "next/server";
import { buildAuthorizationServerMetadata } from "@/server/oauth";

export async function GET() {
  return NextResponse.json(buildAuthorizationServerMetadata(), {
    headers: { "cache-control": "no-store" },
  });
}
