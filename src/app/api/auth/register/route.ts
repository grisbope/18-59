import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  supabasePublishableKey,
  supabaseSecretKey,
  supabaseUrl,
} from "@/lib/supabase";

export const runtime = "nodejs";

function clients() {
  const url = supabaseUrl();
  const publishable = supabasePublishableKey();
  const secret = supabaseSecretKey();
  if (!url || !publishable || !secret) {
    return { error: "Supabase no configurado en el servidor" as const };
  }
  const admin = createClient(url, secret, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const anon = createClient(url, publishable, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return { url, publishable, secret, admin, anon };
}

/** Registro con auto-confirmación vía Secret Key (Admin API) — usable en demo/jurado. */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = String(body.email || "")
      .trim()
      .toLowerCase();
    const password = String(body.password || "");
    const fullName = String(body.fullName || "").trim();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email y contraseña son obligatorios" },
        { status: 400 }
      );
    }
    if (password.length < 8) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 8 caracteres" },
        { status: 400 }
      );
    }

    const c = clients();
    if ("error" in c) {
      return NextResponse.json({ error: c.error }, { status: 503 });
    }

    const { data: created, error: createError } =
      await c.admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: fullName || email.split("@")[0],
          source: "1859-app",
        },
      });

    if (createError) {
      const msg = createError.message || "No se pudo registrar";
      const status = /already|registered|exists/i.test(msg) ? 409 : 400;
      return NextResponse.json({ error: msg }, { status });
    }

    const { data: sessionData, error: loginError } =
      await c.anon.auth.signInWithPassword({ email, password });

    if (loginError || !sessionData.session) {
      return NextResponse.json(
        {
          error:
            loginError?.message ||
            "Cuenta creada, pero no se pudo iniciar sesión automáticamente",
          user: created.user,
        },
        { status: 201 }
      );
    }

    return NextResponse.json({
      user: {
        id: sessionData.user.id,
        email: sessionData.user.email,
        fullName:
          (sessionData.user.user_metadata?.full_name as string) || fullName,
      },
      session: {
        access_token: sessionData.session.access_token,
        refresh_token: sessionData.session.refresh_token,
        expires_at: sessionData.session.expires_at,
      },
      mode: "admin-autoconfirm",
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error de registro" },
      { status: 500 }
    );
  }
}
