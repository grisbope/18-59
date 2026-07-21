import { Suspense } from "react";
import { AuthForm } from "@/components/AuthForm";

export default function AuthPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-8 max-w-xl">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-terracotta)]">
          Cuenta familiar
        </p>
        <h1 className="mt-1 font-[family-name:var(--font-display)] text-4xl text-[var(--color-ink)]">
          Acceso 18:59
        </h1>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          Guarda y comparte tu plan con la comunidad. Para la demo del jurado usa
          «Entrar como demo» — no requiere correo.
        </p>
      </div>
      <Suspense fallback={<p className="text-sm text-[var(--color-muted)]">Cargando…</p>}>
        <AuthForm />
      </Suspense>
    </main>
  );
}
