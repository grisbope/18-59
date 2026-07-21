import Link from "next/link";
import { CommunityDashboard } from "@/components/CommunityDashboard";
import { CtaGeneratePlan } from "@/components/InstallPWAButton";

export function LandingSections() {
  return (
    <>
      <section
        id="utilidad"
        className="mx-auto max-w-6xl px-4 py-16 md:py-20"
        aria-labelledby="utilidad-title"
      >
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-terracotta-dark)]">
          Para qué sirve
        </p>
        <h2
          id="utilidad-title"
          className="mt-3 max-w-3xl font-[family-name:var(--font-display)] text-[clamp(1.75rem,4vw,2.75rem)] leading-tight text-[var(--color-ink)]"
        >
          En segundos: convierte el miedo del sismo en instrucciones claras
          para tu hogar.
        </h2>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-[var(--color-ink-soft)]">
          18:59 no es otra alerta. Es el documento que tu familia necesita cuando
          tiembla: punto de encuentro, ruta, kit de emergencia y pasos Antes /
          Durante / Después — adaptados a tu edificio en Portoviejo.
        </p>

        <ul className="mt-10 grid gap-8 sm:grid-cols-3">
          {[
            {
              t: "Personalizado",
              d: "Según adultos, niños, adultos mayores, mascotas y si alguien necesita ayuda para moverse.",
            },
            {
              t: "Usable en el momento",
              d: "Escúchalo en voz (TTS), guárdalo offline y descárgalo en PDF para la nevera o el chat familiar.",
            },
            {
              t: "También en parques",
              d: "Con 18:59 PortoParques preparas eventos públicos: ferias, actos y reuniones al aire libre.",
            },
          ].map((item) => (
            <li key={item.t} className="section-rise">
              <h3 className="font-[family-name:var(--font-display)] text-xl text-[var(--color-ink)]">
                {item.t}
              </h3>
              <p className="mt-2 text-base leading-relaxed text-[var(--color-ink-soft)]">
                {item.d}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section
        id="como-funciona"
        className="border-y border-[var(--color-border)] bg-[var(--color-paper)] py-16 md:py-20"
      >
        <div className="mx-auto max-w-6xl px-4">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-terracotta-dark)]">
            Cómo te ayuda
          </p>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-[clamp(1.75rem,4vw,2.75rem)] text-[var(--color-ink)]">
            Tres pasos. Un plan vivo.
          </h2>
          <p className="mt-3 max-w-2xl text-lg leading-relaxed text-[var(--color-ink-soft)]">
            De la dirección de tu casa a un plan que toda la familia entiende —
            y que el barrio puede ver en el tablero.
          </p>

          <ol className="mt-12 space-y-0">
            {[
              {
                n: "01",
                t: "Elige tu lugar",
                d: "Usa una plantilla de edificio con gemelo digital post-16A, o escribe tu dirección en Portoviejo.",
              },
              {
                n: "02",
                t: "Genera tu plan",
                d: "La IA arma Antes / Durante / Después con kit de emergencia, ruta y punto de encuentro. Opcional: fotos de fachada e interior.",
              },
              {
                n: "03",
                t: "Escucha, descarga y comparte",
                d: "Voz TTS, PDF, enlace para la familia. El % de hogares con plan sube en el tablero del sector.",
              },
            ].map((s, i) => (
              <li
                key={s.n}
                className="section-rise grid gap-4 border-t border-[var(--color-border)] py-8 md:grid-cols-[5rem_1fr] md:gap-10"
                style={{ animationDelay: `${0.08 * (i + 1)}s` }}
              >
                <span className="font-[family-name:var(--font-display)] text-3xl text-[var(--color-terracotta)]">
                  {s.n}
                </span>
                <div>
                  <h3 className="text-xl font-semibold text-[var(--color-ink)] md:text-2xl">
                    {s.t}
                  </h3>
                  <p className="mt-2 max-w-2xl text-base leading-relaxed text-[var(--color-ink-soft)] md:text-lg">
                    {s.d}
                  </p>
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-4 flex flex-wrap gap-3">
            <CtaGeneratePlan />
            <Link
              href="/portoparques"
              className="inline-flex h-12 items-center justify-center border-2 border-[var(--color-ink)] px-6 text-base font-semibold text-[var(--color-ink)] transition-colors hover:bg-white"
            >
              Probar PortoParques
            </Link>
          </div>
        </div>
      </section>

      <section id="problema" className="mx-auto max-w-6xl px-4 py-16 md:py-20">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-terracotta-dark)]">
          Por qué Portoviejo
        </p>
        <h2 className="mt-3 max-w-3xl font-[family-name:var(--font-display)] text-[clamp(1.75rem,4vw,2.75rem)] leading-tight text-[var(--color-ink)]">
          En 2016 el centro se detuvo. Nueve años después, falta el plan familiar.
        </h2>
        <p className="mt-5 max-w-3xl text-lg leading-relaxed text-[var(--color-ink-soft)]">
          Portoviejo fue zona cero del terremoto 7.8. El reloj del antiguo centro
          comercial municipal se congeló a las 18:58 —hoy monumento en la Plaza
          Memorial San Gregorio—. La brecha no es otra notificación: es no tener
          un plan documentado por edificio, en lenguaje simple.
        </p>
        <dl className="mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-3">
          {[
            { k: "7.8", v: "Magnitud del sismo 16A a las 18:58" },
            { k: "88", v: "Manzanas del centro histórico devastadas" },
            { k: "0 → 1", v: "De ningún plan a un plan vivo compartido" },
          ].map((item) => (
            <div key={item.k}>
              <dt className="font-[family-name:var(--font-display)] text-5xl leading-none text-[var(--color-terracotta)]">
                {item.k}
              </dt>
              <dd className="mt-3 text-base leading-snug text-[var(--color-ink-soft)]">
                {item.v}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section
        id="diferenciadores"
        className="border-y border-[var(--color-border)] bg-[var(--color-paper)] py-16 md:py-20"
      >
        <div className="mx-auto max-w-6xl px-4">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-terracotta-dark)]">
            Qué lo hace distinto
          </p>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-[clamp(1.75rem,4vw,2.75rem)] text-[var(--color-ink)]">
            No es otra app de avisos.
          </h2>
          <div className="mt-10 grid gap-10 md:grid-cols-3">
            {[
              {
                t: "Plan vivo",
                d: "Un documento familiar concreto — no un push que se ignora. Con voz, PDF y modo offline.",
              },
              {
                t: "Gemelo de edificio",
                d: "Datos hiperlocales de vulnerabilidad post-2016 en Portoviejo, en lenguaje que cualquiera entiende.",
              },
              {
                t: "Capa comunitaria",
                d: "Al compartir, el barrio ve cuántos hogares ya tienen plan. Así se mide resiliencia (ODS 11) en vivo.",
              },
            ].map((d) => (
              <article key={d.t} className="section-rise">
                <h3 className="font-[family-name:var(--font-display)] text-2xl text-[var(--color-ink)]">
                  {d.t}
                </h3>
                <p className="mt-3 text-base leading-relaxed text-[var(--color-ink-soft)]">
                  {d.d}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="ods-metrica"
        className="mx-auto max-w-6xl px-4 py-16 md:py-20"
      >
        <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-terracotta-dark)]">
              Impacto medible
            </p>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-[clamp(1.75rem,4vw,2.5rem)] text-[var(--color-ink)]">
              ODS 11 y 13, con métrica en el tablero
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-[var(--color-ink-soft)]">
              Métrica principal: % de hogares en sectores piloto que pasan de no
              tener plan a tener uno generado, guardado y compartido. Secundaria:
              tiempo hasta instrucciones claras en lenguaje simple.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="bg-[var(--color-ink)] px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-white">
                ODS 11 · Ciudades sostenibles
              </span>
              <span className="bg-[var(--color-resilience)] px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-white">
                ODS 13 · Acción por el clima
              </span>
            </div>
          </div>
          <CommunityDashboard />
        </div>
      </section>

      <section
        id="jurado-cta"
        className="border-t border-[var(--color-border)] bg-[var(--color-ink)] py-16 text-[var(--color-paper)] md:py-20"
      >
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="font-[family-name:var(--font-display)] text-[clamp(1.75rem,4vw,2.75rem)] leading-tight">
            Para el jurado: entiendan el producto en tres minutos.
          </h2>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-white/85">
            Stack transparente (Next.js PWA, Supabase, OpenAI GPT + Vision + TTS,
            RAG). Ruta demo lista. Historia hiperlocal de Portoviejo con utilidad
            real para familias.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/jurado"
              className="inline-flex h-12 items-center justify-center bg-[var(--color-terracotta)] px-6 text-base font-semibold text-white transition-colors hover:bg-[var(--color-terracotta-dark)]"
            >
              Guía del jurado
            </Link>
            <Link
              href="/auth?next=/plan"
              className="inline-flex h-12 items-center justify-center border-2 border-white/80 px-6 text-base font-semibold text-white transition-colors hover:bg-white/10"
            >
              Entrar como demo
            </Link>
            <Link
              href="/plan"
              className="inline-flex h-12 items-center justify-center px-4 text-base font-semibold text-white underline-offset-4 hover:underline"
            >
              Generar plan →
            </Link>
          </div>
          <ul className="mt-10 flex flex-wrap gap-x-4 gap-y-2 text-sm font-medium text-white/70">
            {[
              "Next.js PWA",
              "Supabase",
              "OpenAI GPT",
              "Vision",
              "TTS",
              "RAG",
              "Workbox",
            ].map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
