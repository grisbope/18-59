import Link from "next/link";

const openaiTools = [
  {
    name: "GPT (texto)",
    why: "Genera el plan de resiliencia familiar en lenguaje simple, citando fuentes del corpus RAG (informes post-16A y SNGR).",
  },
  {
    name: "GPT-4o Vision",
    why: "Analiza fotos de fachada y explica señales visibles de vulnerabilidad comparadas con patrones documentados post-16A — feature bonus altamente demoable.",
  },
  {
    name: "Text-to-Speech (OpenAI)",
    why: "Accesibilidad por voz del plan para hogares con barreras digitales o baja alfabetización digital.",
  },
  {
    name: "Embeddings + RAG",
    why: "Recupera fragmentos relevantes de informes de Portoviejo y lineamientos oficiales antes de escribir el plan.",
  },
  {
    name: "Agents SDK (orquestación)",
    why: "Encadena: edificio + perfil + fotos → Vision → RAG informe → plan de acción → documento → Supabase → tablero.",
  },
  {
    name: "Codex",
    why: "Usado durante el desarrollo para scaffolding de la PWA, APIs, componentes y schema Supabase.",
  },
];

const checklist = [
  "ODS principal declarado: ODS 11 (con ODS 13)",
  "Problema validado con datos reales del 16A / informes de vulnerabilidad",
  "Prototipo funcional extremo a extremo (edificio → plan → comunidad → offline)",
  "Código en repositorio accesible (GitHub)",
  "Uso obligatorio de herramientas OpenAI documentado",
  "Privacidad: solo agregados por sector; fotos/ubicación no individuales en tablero",
  "Citación de fuentes en decisiones de seguridad",
  "Auth Supabase: registro (auto-confirm Admin API) + login + cuenta demo jurado",
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
        resiliencia familiar desde Portoviejo.
      </p>

      <section className="mt-8 rounded-md border border-[var(--color-terracotta)] bg-[var(--color-paper)] p-5">
        <h2 className="font-[family-name:var(--font-display)] text-xl">
          Guion demo (≈3 minutos)
        </h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-[var(--color-ink-soft)]">
          <li>
            Abre{" "}
            <Link href="/auth?next=/plan" className="font-semibold text-[var(--color-terracotta)] underline">
              /auth
            </Link>{" "}
            → <strong>Entrar como demo (jurado)</strong>.
          </li>
          <li>
            En{" "}
            <Link href="/plan" className="font-semibold underline">
              /plan
            </Link>
            : selecciona <strong>Sucre 214</strong> o <strong>Olmedo 88</strong> →
            revisa gemelo digital.
          </li>
          <li>Genera plan (marca adultos mayores/niños) → escucha / descarga.</li>
          <li>
            <strong>Compartir con comunidad</strong> → el % del sector sube en el
            tablero (métrica del pitch).
          </li>
          <li>Opcional: foto de fachada (Vision) · DevTools Offline → plan cacheado.</li>
        </ol>
        <p className="mt-3 text-xs text-[var(--color-muted)]">
          Auth auditado con Secret Key: signup sin confirmación de correo (Admin
          API), login password, cuenta demo confirmada.
        </p>
      </section>

      <section className="mt-10" aria-labelledby="openai-title">
        <h2 id="openai-title" className="font-[family-name:var(--font-display)] text-2xl">
          Tecnologías OpenAI usadas
        </h2>
        <ul className="mt-4 space-y-3">
          {openaiTools.map((t) => (
            <li key={t.name} className="border border-[var(--color-border)] bg-white p-4">
              <p className="font-bold text-[var(--color-ink)]">{t.name}</p>
              <p className="mt-1 text-sm text-[var(--color-muted)]">{t.why}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10" aria-labelledby="arch-title">
        <h2 id="arch-title" className="font-[family-name:var(--font-display)] text-2xl">
          Infraestructura / arquitectura
        </h2>
        <pre className="mt-4 overflow-x-auto rounded-md border border-[var(--color-border)] bg-[var(--color-paper)] p-4 text-xs leading-relaxed text-[var(--color-ink)]">
{`┌─────────────────────────────────────────────────────────┐
│  PWA Next.js (App Router) + Workbox Service Worker      │
│  Hero · MapPicker · BuildingTwin · Plan · Dashboard     │
└───────────────┬──────────────────────────┬──────────────┘
                │                          │
                ▼                          ▼
┌──────────────────────────┐   ┌──────────────────────────┐
│ Agente orquestador       │   │ Supabase                 │
│ OpenAI Agents pattern    │   │ Auth · Storage · (SQL)   │
│ edificio→RAG→plan→board  │   │ agregados por sector     │
└───────────────┬──────────┘   └──────────────────────────┘
                ▼
┌──────────────────────────┐
│ RAG + vector/embeddings  │
│ Corpus Portoviejo+SNGR   │
└──────────────────────────┘
Hosting: VPS EasyPanel/Traefik · Offline: Cache API + localStorage
Auth: register (Admin autoconfirm) · login · demo@18-59.grisbope.com`}
        </pre>
      </section>

      <section className="mt-10" aria-labelledby="flow-title">
        <h2 id="flow-title" className="font-[family-name:var(--font-display)] text-2xl">
          Flujo de usuario
        </h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-[var(--color-ink-soft)]">
          <li>Landing / instalar PWA → CTA «Generar mi plan» o Auth demo.</li>
          <li>Tablero comunitario arriba (métrica en vivo).</li>
          <li>Mapa: seleccionar bloque → gemelo digital y nivel de riesgo.</li>
          <li>Perfil del hogar + fotos (exterior/interior obligatorias; entorno opcional).</li>
          <li>Un solo botón genera: Vision → plan RAG+GPT con citas.</li>
          <li>Descargar / cachear offline / compartir con comunidad (Auth opcional).</li>
        </ol>
        <p className="mt-3 text-sm">
          Demo: <Link href="/plan" className="font-semibold text-[var(--color-terracotta)] underline">/plan</Link>
          {" · "}
          <Link href="/auth" className="font-semibold text-[var(--color-terracotta)] underline">/auth</Link>
        </p>
      </section>

      <section className="mt-10" aria-labelledby="check-title">
        <h2 id="check-title" className="font-[family-name:var(--font-display)] text-2xl">
          Checklist de rúbrica
        </h2>
        <ul className="mt-4 space-y-2">
          {checklist.map((c) => (
            <li key={c} className="flex gap-2 text-sm">
              <span className="font-bold text-[var(--color-resilience)]" aria-hidden>
                ✓
              </span>
              <span>{c}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10" aria-labelledby="metrics-title">
        <h2 id="metrics-title" className="font-[family-name:var(--font-display)] text-2xl">
          Objetivos / métricas
        </h2>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-[var(--color-ink-soft)]">
          <li>
            Principal: % hogares con plan documentado (tablero en vivo —{" "}
            <Link href="/comunidad" className="underline">
              /comunidad
            </Link>
            ).
          </li>
          <li>
            Secundaria: tiempo desde aviso oficial hasta instrucciones adaptadas
            (medible en el flujo del agente + TTS).
          </li>
        </ul>
      </section>

      <section className="mt-10 mb-6" aria-labelledby="scale-title">
        <h2 id="scale-title" className="font-[family-name:var(--font-display)] text-2xl">
          Escalabilidad — plantilla territorial
        </h2>
        <p className="mt-3 text-sm text-[var(--color-ink-soft)]">
          Las capas de riesgo (`src/data/buildings.json`) y el corpus
          (`src/data/corpus/`) se reemplazan para otra ciudad sin reescribir la app —
          mismo patrón de adaptación territorial que FloodFact AI o proyectos Mekong.
          Roadmap: más fuentes municipales/universidades y API pública de perfiles de
          riesgo.
        </p>
        <p className="mt-4 text-sm">
          README completo:{" "}
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
