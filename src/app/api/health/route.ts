import { NextResponse } from "next/server";
import { hasOpenAI } from "@/lib/openai";
import { hasSupabase } from "@/lib/supabase";
import { getGoogleMapsApiKey } from "@/lib/geo";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    ok: true,
    app: "18:59",
    openai: hasOpenAI(),
    supabase: hasSupabase(),
    googleMaps: Boolean(getGoogleMapsApiKey()),
    time: new Date().toISOString(),
  });
}
