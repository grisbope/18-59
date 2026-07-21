import Link from "next/link";

const openaiTools = [
  {
    name: "GPT (texto)",
    why: "Genera el plan de resiliencia familiar en lenguaje simple, citando fuentes del corpus RAG (informes post-16A y SNGR).",
  },
  {
    name: "GPT-4o Vision",
    why: "Analiza fotos exterior/interior (+ entorno opcional) y explica señales visibles de vulnerabilidad vs patrones post-16A.",
  },
  {
    name: "Text-to-Speech (OpenAI)",
    why: "Lee el plan en voz alta (accesibilidad / barreras digitales).",
  },
  {
    name: "Embeddings + RAG",
    why: "Recupera fragmentos de informes de Portoviejo y lineamientos oficiales antes de escribir el plan.",
  },
  {
    name: "Agents SDK (orquestación)",
    why: "Encadena: ubicación (plantilla o dirección) + perfil + fotos → Vision → RAG → plan → documento → Supabase → tablero.",
  },
  {
    name: "Codex",
    why: "Scaffolding de la PWA, APIs, componentes y despliegue en VPS durante el desarrollo.",
  },
];

const checklist = [
  "ODS principal declarado: ODS 11 (con ODS 13)",
  "Problema validado con datos reales del 16A / informes de vulnerabilidad",
  "Prototipo funcional E2E en producción (VPS): ubicación → fotos → plan → comunidad → offline",
  "Código en repositorio accesible (GitHub)",
  "Uso obligatorio de herramientas OpenAI documentado",
  "Privacidad: solo agregados por sector; fotos/ubicación no individuales en tablero",
  "Citación de fuentes en decisiones de seguridad (texto limpio, sin markdown crudo)",
  "Auth Supabase: registro + login + cuenta demo jurado",
  "Hosting en VPS propio (EasyPanel + Traefik + Docker Swarm), no Vercel",
];

export default function JuradoPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-terracotta)]">
        Sección obligatoria
      </p>
      <h1 className="mt-1 font-[family-name:var(--font-display)] text-4xl md:text-5xl">
        Para el jurado
      </h1>
      <p className="mt-3 text-[var(--color-ink-soft)]">
        Transparencia técnica de <strong>18:59</strong> — PWA de planes de
        resiliencia familiar desde Portoviejo. Producción:{" "}
        <a
          href="https://18-59.grisbope.com"
          className="font-semibold text-[var(--color-terracotta)] underline"
          target="_blank"
          rel="noreferrer"
        >
          18-59.grisbope.com
        </a>
        .
      </p>

      <section className="mt-8 rounded-md border border-[var(--color-terracotta)] bg-[var(--color-paper)] p-5">
        <h2 className="font-[family-name:var(--font-display)] text-xl">
          Guion demo (≈3 minutos)
        </h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-[var(--color-ink-soft)]">
          <li>
            Abre{" "}
            <Link
              href="/auth?next=/plan"
              className="font-semibold text-[var(--color-terracotta)] underline"
            >
              /auth
            </Link>{" "}
            → <strong>Entrar como demo (jurado)</strong>.
          </li>
          <li>
            En{" "}
            <Link href="/plan" className="font-semibold underline">
              /plan
            </Link>
            : tablero → plantilla o dirección → fotos → crear plan. También
            prueba{" "}
            <Link href="/portoparques" className="font-semibold underline">
              /portoparques
            </Link>{" "}
            (eventos en parques).
          </li>
          <li>
            Con plantilla verás el perfil de riesgo; con dirección solo la
            ubicación (sin gemelo inventado).
          </li>
          <li>
            Perfil del hogar → fotos exterior + interior →{" "}
            <strong>Generar plan de acción</strong>.
          </li>
          <li>
            <strong>Compartir con comunidad</strong> → el % del sector sube en el
            tablero.
          </li>
          <li>DevTools Offline → plan cacheado (razón de ser PWA).</li>
        </ol>
        <p className="mt-3 text-xs text-[var(--color-muted)]">
          Auth: Admin API auto-confirm · login · demo@18-59.grisbope.com
        </p>
      </section>

      <section className="mt-10" aria-labelledby="openai-title">
        <h2
          id="openai-title"
          className="font-[family-name:var(--font-display)] text-2xl"
        >
          Tecnologías OpenAI usadas
        </h2>
        <ul className="mt-4 space-y-3">
          {openaiTools.map((t) => (
            <li
              key={t.name}
              className="border border-[var(--color-border)] bg-white p-4"
            >
              <p className="font-bold text-[var(--color-ink)]">{t.name}</p>
              <p className="mt-1 text-sm text-[var(--color-muted)]">{t.why}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10" aria-labelledby="arch-title">
        <h2
          id="arch-title"
          className="font-[family-name:var(--font-display)] text-2xl"
        >
          Infraestructura / arquitectura
        </h2>
        <pre className="mt-4 overflow-x-auto rounded-md border border-[var(--color-border)] bg-[var(--color-paper)] p-4 text-xs leading-relaxed text-[var(--color-ink)]">
{`┌─────────────────────────────────────────────────────────┐
│  PWA Next.js 15 + Workbox  ·  https://18-59.grisbope.com │
│  Comunidad · Ubicación (plantilla | dirección) · Fotos  │
│  Vision → Plan → TTS → Tablero                          │
└───────────────┬──────────────────────────┬──────────────┘
                │                          │
                ▼                          ▼
┌──────────────────────────┐   ┌──────────────────────────┐
│ Agente OpenAI            │   │ Supabase                 │
│ Vision · GPT · TTS · RAG │   │ Auth · Storage agregados │
└───────────────┬──────────┘   └──────────────────────────┘
                ▼
┌──────────────────────────┐
│ Corpus Portoviejo + SNGR │
└──────────────────────────┘

Hosting: VPS DigitalOcean (159.65.234.56)
         EasyPanel + Docker Swarm + Traefik + Let's Encrypt
Deploy:  push a main → auto-pull cada 2 min (deploy/auto-pull.sh)
         NO usamos Vercel en producción
Offline: Service Worker + Cache API + localStorage del plan`}
        </pre>
        <ul className="mt-4 space-y-1 text-sm text-[var(--color-ink-soft)]">
          <li>
            Producción:{" "}
            <a
              href="https://18-59.grisbope.com"
              className="underline"
              target="_blank"
              rel="noreferrer"
            >
              https://18-59.grisbope.com
            </a>
          </li>
          <li>
            Health:{" "}
            <a
              href="https://18-59.grisbope.com/api/health"
              className="underline"
              target="_blank"
              rel="noreferrer"
            >
              /api/health
            </a>
          </li>
          <li>
            Repo:{" "}
            <a
              href="https://github.com/grisbope/18-59"
              className="underline"
              target="_blank"
              rel="noreferrer"
            >
              github.com/grisbope/18-59
            </a>
          </li>
        </ul>
      </section>

      <section className="mt-10" aria-labelledby="flow-title">
        <h2
          id="flow-title"
          className="font-[family-name:var(--font-display)] text-2xl"
        >
          Flujo de usuario
        </h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-[var(--color-ink-soft)]">
          <li>Landing / instalar PWA → CTA o Auth demo.</li>
          <li>Tablero comunitario arriba (métrica en vivo).</li>
          <li>
            Ubicación: <strong>plantilla</strong> (carga perfil de riesgo){" "}
            <em>o</em> <strong>mi dirección</strong> (sin gemelo digital).
          </li>
          <li>Perfil del hogar + fotos (exterior/interior obligatorias).</li>
          <li>Un botón: Vision → plan RAG+GPT con citas limpias.</li>
          <li>Descargar / offline / compartir → % comunitario sube.</li>
        </ol>
        <p className="mt-3 text-sm">
          Demo:{" "}
          <Link
            href="/plan"
            className="font-semibold text-[var(--color-terracotta)] underline"
          >
            /plan
          </Link>
          {" · "}
          <Link
            href="/auth"
            className="font-semibold text-[var(--color-terracotta)] underline"
          >
            /auth
          </Link>
          {" · "}
          <a
            href="https://18-59.grisbope.com/api/health"
            className="font-semibold text-[var(--color-terracotta)] underline"
            target="_blank"
            rel="noreferrer"
          >
            /api/health
          </a>
        </p>
      </section>

      <section className="mt-10" aria-labelledby="check-title">
        <h2
          id="check-title"
          className="font-[family-name:var(--font-display)] text-2xl"
        >
          Checklist de rúbrica
        </h2>
        <ul className="mt-4 space-y-2">
          {checklist.map((c) => (
            <li key={c} className="flex gap-2 text-sm">
              <span
                className="font-bold text-[var(--color-resilience)]"
                aria-hidden
              >
                ✓
              </span>
              <span>{c}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10" aria-labelledby="metrics-title">
        <h2
          id="metrics-title"
          className="font-[family-name:var(--font-display)] text-2xl"
        >
          Objetivos / métricas
        </h2>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-[var(--color-ink-soft)]">
          <li>
            Principal: % hogares con plan documentado (tablero —{" "}
            <Link href="/comunidad" className="underline">
              /comunidad
            </Link>
            ).
          </li>
          <li>
            Secundaria: tiempo hasta instrucciones adaptadas (agente + TTS).
          </li>
        </ul>
      </section>

      <section className="mt-10 mb-6" aria-labelledby="scale-title">
        <h2
          id="scale-title"
          className="font-[family-name:var(--font-display)] text-2xl"
        >
          Escalabilidad — plantilla territorial
        </h2>
        <p className="mt-3 text-sm text-[var(--color-ink-soft)]">
          Las capas de riesgo (`src/data/buildings.json`) y el corpus
          (`src/data/corpus/`) se reemplazan para otra ciudad sin reescribir la
          app. Roadmap: más fuentes municipales y API pública de perfiles de
          riesgo.
        </p>
        <p className="mt-4 text-sm">
          README:{" "}
          <a
            href="https://github.com/grisbope/18-59/blob/main/README.md"
            className="font-semibold text-[var(--color-terracotta)] underline"
            target="_blank"
            rel="noreferrer"
          >
            github.com/grisbope/18-59
          </a>
        </p>
      </section>
    </main>
  );
}
