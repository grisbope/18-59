import { NextResponse } from "next/server";
import {
  hasSupabase,
  supabasePublishableKey,
  supabaseSecretKey,
  supabaseUrl,
} from "@/lib/supabase";

export const runtime = "nodejs";

/** Estado público de Auth/Supabase (sin exponer secretos). */
export async function GET() {
  return NextResponse.json({
    configured: hasSupabase(),
    url: Boolean(supabaseUrl()),
    publishable: Boolean(supabasePublishableKey()),
    secret: Boolean(supabaseSecretKey()),
    demoEmail: "demo@18-59.grisbope.com",
    features: {
      registerAutoconfirm: true,
      demoLogin: true,
      communityStorage: true,
    },
  });
}
