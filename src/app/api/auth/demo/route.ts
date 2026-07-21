import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  supabasePublishableKey,
  supabaseSecretKey,
  supabaseUrl,
} from "@/lib/supabase";

export const runtime = "nodejs";

const DEMO_EMAIL = "demo@18-59.grisbope.com";
const DEMO_PASSWORD = "Demo1859!Jurado";

/** Un clic para el jurado: asegura cuenta demo confirmada y devuelve sesión. */
export async function POST() {
  try {
    const url = supabaseUrl();
    const publishable = supabasePublishableKey();
    const secret = supabaseSecretKey();
    if (!url || !publishable || !secret) {
      return NextResponse.json(
        { error: "Supabase no configurado" },
        { status: 503 }
      );
    }

    const admin = createClient(url, secret, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const anon = createClient(url, publishable, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // Intentar login; si falla, crear/confirmar demo
    let { data, error } = await anon.auth.signInWithPassword({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
    });

    if (error || !data.session) {
      await admin.auth.admin.createUser({
        email: DEMO_EMAIL,
        password: DEMO_PASSWORD,
        email_confirm: true,
        user_metadata: {
          full_name: "Cuenta Demo Jurado",
          role: "demo",
        },
      });
      ({ data, error } = await anon.auth.signInWithPassword({
        email: DEMO_EMAIL,
        password: DEMO_PASSWORD,
      }));
    }

    if (error || !data.session || !data.user) {
      return NextResponse.json(
        { error: error?.message || "No se pudo iniciar sesión demo" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      user: {
        id: data.user.id,
        email: data.user.email,
        fullName: "Cuenta Demo Jurado",
      },
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at,
      },
      demo: true,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error demo auth" },
      { status: 500 }
    );
  }
}
