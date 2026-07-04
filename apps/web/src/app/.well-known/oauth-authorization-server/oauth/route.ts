import { NextResponse } from "next/server";
import { buildAuthorizationServerMetadata } from "@/server/oauth";

/** Discovery RFC 8414 cuando el issuer contiene la ruta `/oauth`. */
export async function GET() {
  return NextResponse.json(buildAuthorizationServerMetadata(), {
    headers: { "cache-control": "no-store" },
  });
}
