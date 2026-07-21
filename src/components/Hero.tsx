"use client";

import Link from "next/link";
import { StoppedClock } from "@/components/StoppedClock";
import { CtaGeneratePlan } from "@/components/InstallPWAButton";

export function Hero() {
  return (
    <section
      className="relative overflow-hidden border-b border-[var(--color-border)]"
      aria-labelledby="hero-brand"
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 15% 20%, color-mix(in srgb, var(--color-terracotta) 14%, transparent), transparent 55%), radial-gradient(ellipse 70% 50% at 90% 80%, color-mix(in srgb, var(--color-resilience) 10%, transparent), transparent 50%), var(--color-paper)",
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%231A1A1A' fill-opacity='1'%3E%3Cpath d='M0 39h40v1H0zM39 0v40h1V0z'/%3E%3C/g%3E%3C/svg%3E\")",
        }}
        aria-hidden
      />
      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-14 md:grid-cols-[1.15fr_0.85fr] md:py-20 lg:py-24">
        <div className="hero-copy">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-[var(--color-terracotta-dark)]">
            Portoviejo · Ecuador · ODS 11 y 13
          </p>
          <h1
            id="hero-brand"
            className="font-[family-name:var(--font-display)] text-[clamp(3.5rem,12vw,6.5rem)] leading-[0.9] tracking-tight text-[var(--color-ink)]"
          >
            18:59
          </h1>
          <p className="mt-6 max-w-[34rem] text-[clamp(1.25rem,2.4vw,1.65rem)] font-semibold leading-snug text-[var(--color-ink)]">
            El plan de qué hacer antes, durante y después de un sismo — para tu
            familia y tu edificio.
          </p>
          <p className="mt-4 max-w-[34rem] text-base leading-relaxed text-[var(--color-ink-soft)] md:text-lg">
            En 2016 el reloj se detuvo en 18:58. Nosotros construimos el minuto
            siguiente: un plan que puedes escuchar, descargar en PDF y compartir
            con tu barrio.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <CtaGeneratePlan />
            <Link
              href="/auth?next=/plan"
              className="inline-flex h-12 items-center justify-center border-2 border-[var(--color-ink)] bg-transparent px-6 text-base font-semibold text-[var(--color-ink)] transition-colors hover:bg-white"
            >
              Probar demo
            </Link>
          </div>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-[var(--color-ink-soft)]">
            En ~3 minutos: entrar como demo → generar plan (Sucre 214) →
            escuchar → PDF → compartir.
          </p>
        </div>
        <div className="flex flex-col items-center gap-4 md:items-end">
          <StoppedClock className="h-64 w-64 md:h-[22rem] md:w-[22rem]" />
          <p className="max-w-[14rem] text-center text-xs leading-relaxed text-[var(--color-ink-soft)] md:text-right">
            El reloj de Plaza Memorial marcó 18:58. 18:59 es el minuto en que ya
            sabes qué hacer.
          </p>
        </div>
      </div>
    </section>
  );
}
