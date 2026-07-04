import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/server/repositories/supabase/server-client";

export const dynamic = "force-dynamic";

/** Cierra sesión (POST para evitar que se dispare desde un simple link/prefetch) y limpia cookies de auth. */
export async function POST(request: Request) {
  const supabase = await getSupabaseServerClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/", request.url));
}
