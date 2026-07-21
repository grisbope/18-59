import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabasePublishableKey, supabaseUrl } from "@/lib/supabase";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = String(body.email || "")
      .trim()
      .toLowerCase();
    const password = String(body.password || "");
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email y contraseña son obligatorios" },
        { status: 400 }
      );
    }

    const url = supabaseUrl();
    const key = supabasePublishableKey();
    if (!url || !key) {
      return NextResponse.json(
        { error: "Supabase no configurado" },
        { status: 503 }
      );
    }

    const anon = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data, error } = await anon.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.session || !data.user) {
      const msg = error?.message || "Credenciales inválidas";
      const hint = /confirm/i.test(msg)
        ? "Debes confirmar el email o usa el registro de la app (auto-confirma)."
        : undefined;
      return NextResponse.json({ error: msg, hint }, { status: 401 });
    }

    return NextResponse.json({
      user: {
        id: data.user.id,
        email: data.user.email,
        fullName: (data.user.user_metadata?.full_name as string) || "",
      },
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at,
      },
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error de login" },
      { status: 500 }
    );
  }
}
