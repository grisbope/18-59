"use client";

import Link from "next/link";
import { useMemo, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/Button";
import { Card, CardDescription, CardTitle } from "@/components/ui/Card";

type Mode = "login" | "register";

export function AuthForm({ initialMode = "login" }: { initialMode?: Mode }) {
  const { login, register, loginDemo, user } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/plan";

  const [mode, setMode] = useState<Mode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const title = useMemo(
    () => (mode === "login" ? "Iniciar sesión" : "Crear cuenta"),
    [mode]
  );

  if (user) {
    return (
      <Card className="mx-auto max-w-md">
        <CardTitle>Ya estás dentro</CardTitle>
        <CardDescription>
          {user.fullName || user.email} · sesión activa en este dispositivo.
        </CardDescription>
        <div className="mt-4 flex gap-2">
          <Button asChild>
            <Link href={next}>Continuar al plan</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/comunidad">Ver comunidad</Link>
          </Button>
        </div>
      </Card>
    );
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (mode === "login") await login(email, password);
      else await register(email, password, fullName);
      router.push(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo autenticar");
    } finally {
      setBusy(false);
    }
  }

  async function onDemo() {
    setBusy(true);
    setError(null);
    try {
      await loginDemo();
      router.push(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error demo");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="mx-auto max-w-md" aria-labelledby="auth-title">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-terracotta)]">
        Supabase Auth
      </p>
      <CardTitle id="auth-title" className="mt-1">
        {title}
      </CardTitle>
      <CardDescription>
        El registro auto-confirma con la Secret Key (Admin API) para que el
        jurado demuestre el flujo sin depender del correo.
      </CardDescription>

      <form className="mt-5 space-y-3" onSubmit={onSubmit}>
        {mode === "register" && (
          <label className="block text-sm">
            Nombre
            <input
              className="mt-1 h-11 w-full rounded-md border border-[var(--color-border)] px-3"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              autoComplete="name"
              placeholder="Familia Pérez"
            />
          </label>
        )}
        <label className="block text-sm">
          Email
          <input
            required
            type="email"
            className="mt-1 h-11 w-full rounded-md border border-[var(--color-border)] px-3"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            placeholder="tu@correo.com"
          />
        </label>
        <label className="block text-sm">
          Contraseña
          <input
            required
            type="password"
            minLength={8}
            className="mt-1 h-11 w-full rounded-md border border-[var(--color-border)] px-3"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            placeholder="Mínimo 8 caracteres"
          />
        </label>

        {error && (
          <p className="text-sm text-[var(--color-terracotta)]" role="alert">
            {error}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={busy}>
          {busy ? "Procesando…" : mode === "login" ? "Entrar" : "Registrarme"}
        </Button>
      </form>

      <div className="mt-4 space-y-2">
        <Button
          type="button"
          variant="resilience"
          className="w-full"
          onClick={() => void onDemo()}
          disabled={busy}
        >
          Entrar como demo (jurado)
        </Button>
        <button
          type="button"
          className="w-full text-sm font-semibold text-[var(--color-ink-soft)] underline-offset-4 hover:underline"
          onClick={() => {
            setMode(mode === "login" ? "register" : "login");
            setError(null);
          }}
        >
          {mode === "login"
            ? "¿No tienes cuenta? Regístrate"
            : "¿Ya tienes cuenta? Inicia sesión"}
        </button>
      </div>
    </Card>
  );
}
