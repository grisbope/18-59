import { NextResponse } from "next/server";
import { hasOpenAI } from "@/lib/openai";
import { hasSupabase } from "@/lib/supabase";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    ok: true,
    app: "18:59",
    openai: hasOpenAI(),
    supabase: hasSupabase(),
    time: new Date().toISOString(),
  });
}
