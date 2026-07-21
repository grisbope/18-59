"use client";

import Link from "next/link";
import { StoppedClock } from "@/components/StoppedClock";
import { CtaGeneratePlan, InstallPWAButton } from "@/components/InstallPWAButton";

export function Hero() {
  return (
    <section
      className="relative overflow-hidden border-b border-[var(--color-border)] bg-[var(--color-paper)]"
      aria-labelledby="hero-brand"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%231A1A1A' fill-opacity='1'%3E%3Cpath d='M0 39h40v1H0zM39 0v40h1V0z'/%3E%3C/g%3E%3C/svg%3E\")",
        }}
        aria-hidden
      />
      <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-[1.1fr_0.9fr] md:py-24">
        <div className="hero-copy">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-[var(--color-terracotta)]">
            Portoviejo · Ecuador
          </p>
          <h1
            id="hero-brand"
            className="font-[family-name:var(--font-display)] text-6xl leading-none tracking-tight text-[var(--color-ink)] md:text-8xl"
          >
            18:59
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-[var(--color-ink-soft)] md:text-xl">
            En 2016 el reloj se detuvo en 18:58. Nosotros construimos el minuto
            siguiente.
          </p>
          <p className="mt-3 max-w-xl text-sm text-[var(--color-muted)]">
            Generador de planes de resiliencia familiar con IA — gemelo digital
            de edificio y capa comunitaria. ODS 11 y 13.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <CtaGeneratePlan />
            <InstallPWAButton />
            <Link
              href="/auth?next=/plan"
              className="inline-flex h-12 items-center px-3 text-sm font-semibold text-[var(--color-ink)] underline-offset-4 hover:underline"
            >
              Entrar / Demo
            </Link>
            <Link
              href="/jurado"
              className="inline-flex h-12 items-center px-3 text-sm font-semibold text-[var(--color-ink)] underline-offset-4 hover:underline"
            >
              Para el jurado
            </Link>
          </div>
          <p className="mt-4 text-xs text-[var(--color-muted)]">
            Ruta demo (~3 min): Jurado → Entrar como demo → Generar plan (Sucre 214) →
            Compartir → ver % en comunidad.
          </p>
        </div>
        <div className="flex justify-center md:justify-end">
          <StoppedClock className="h-64 w-64 md:h-80 md:w-80" />
        </div>
      </div>
    </section>
  );
}
