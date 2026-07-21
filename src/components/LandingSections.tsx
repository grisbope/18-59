import { CommunityDashboard } from "@/components/CommunityDashboard";

export function LandingSections() {
  return (
    <>
      <section id="problema" className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="font-[family-name:var(--font-display)] text-3xl text-[var(--color-ink)] md:text-4xl">
          Problema y evidencia
        </h2>
        <p className="mt-3 max-w-3xl text-[var(--color-ink-soft)]">
          Portoviejo fue zona cero del terremoto 7.8 de 2016. El reloj del antiguo
          centro comercial municipal se congeló a las 18:58 —hoy monumento en la
          Plaza Memorial San Gregorio—. Nueve años después, la brecha no es otra
          notificación: es la ausencia de un plan familiar documentado por edificio.
        </p>
        <dl className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            { k: "7.8", v: "Magnitud del sismo 16A · 18:58" },
            { k: "88", v: "Manzanas del centro histórico devastadas" },
            { k: "0→1", v: "Brecha: de ningún plan a plan vivo compartido" },
          ].map((item) => (
            <div
              key={item.k}
              className="border border-[var(--color-border)] bg-white p-5"
            >
              <dt className="font-[family-name:var(--font-display)] text-4xl text-[var(--color-terracotta)]">
                {item.k}
              </dt>
              <dd className="mt-2 text-sm text-[var(--color-muted)]">{item.v}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section id="como-funciona" className="border-y border-[var(--color-border)] bg-[var(--color-paper)] py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="font-[family-name:var(--font-display)] text-3xl text-[var(--color-ink)] md:text-4xl">
            Cómo funciona
          </h2>
          <p className="mt-2 max-w-2xl text-[var(--color-ink-soft)]">
            Tres pasos. Un documento vivo. Una comunidad que se ve en el tablero.
          </p>
          <ol className="mt-8 grid gap-6 md:grid-cols-3">
            {[
              {
                n: "01",
                t: "Selecciona tu edificio",
                d: "Mapa interactivo con gemelo digital e informe de vulnerabilidad post-16A en lenguaje simple.",
              },
              {
                n: "02",
                t: "Recibe tu plan vivo",
                d: "Antes / durante / después — sismo, inundación o sequía — adaptado a tu familia, con fuentes citadas y voz.",
              },
              {
                n: "03",
                t: "Comparte con tu comunidad",
                d: "Vecinos y líderes barriales; el % de hogares con plan documentado sube en el tablero del sector.",
              },
            ].map((s) => (
              <li key={s.n} className="border border-[var(--color-border)] bg-white p-6">
                <span className="text-xs font-bold tracking-[0.2em] text-[var(--color-terracotta)]">
                  {s.n}
                </span>
                <h3 className="mt-2 font-[family-name:var(--font-display)] text-xl">
                  {s.t}
                </h3>
                <p className="mt-2 text-sm text-[var(--color-muted)]">{s.d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="diferenciadores" className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="font-[family-name:var(--font-display)] text-3xl text-[var(--color-ink)] md:text-4xl">
          Por qué no es “otra app más”
        </h2>
        <p className="mt-2 max-w-2xl text-[var(--color-ink-soft)]">
          Tres piezas que ninguna plataforma genérica de avisos tiene.
        </p>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {[
            {
              t: "Plan vivo",
              d: "El output es un documento familiar personalizado — no un mensaje que se ignora y se olvida. Disponible offline.",
            },
            {
              t: "Gemelo digital de edificio",
              d: "Informes reales de vulnerabilidad sísmica de Portoviejo post-2016: dato hiperlocal por bloque.",
            },
            {
              t: "Capa comunitaria",
              d: "Planes compartidos con el barrio; tablero agregado por sector. Así se mide ODS 11 en vivo.",
            },
          ].map((d) => (
            <article key={d.t} className="border-l-4 border-[var(--color-resilience)] pl-4">
              <h3 className="font-[family-name:var(--font-display)] text-xl">{d.t}</h3>
              <p className="mt-2 text-sm text-[var(--color-muted)]">{d.d}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="ods-metrica" className="border-y border-[var(--color-border)] bg-[var(--color-paper)] py-16">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 lg:grid-cols-2">
          <div>
            <h2 className="font-[family-name:var(--font-display)] text-3xl text-[var(--color-ink)]">
              ODS y métrica en vivo
            </h2>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded bg-[var(--color-ink)] px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
                ODS 11 · Ciudades sostenibles
              </span>
              <span className="rounded bg-[var(--color-resilience)] px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
                ODS 13 · Acción por el clima
              </span>
            </div>
            <p className="mt-4 text-sm text-[var(--color-ink-soft)]">
              Métrica principal del pitch: porcentaje de hogares en sectores piloto
              que pasan de no tener plan a tener uno generado, guardado y compartido.
              Secundaria: tiempo hasta instrucciones adaptadas en lenguaje simple.
            </p>
          </div>
          <CommunityDashboard />
        </div>
      </section>

      <section id="tecnologia" className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="font-[family-name:var(--font-display)] text-3xl text-[var(--color-ink)]">
          Tecnología
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-[var(--color-ink-soft)]">
          Transparencia del stack. Detalle completo para evaluación en{" "}
          <a href="/jurado" className="font-semibold text-[var(--color-terracotta)] underline">
            /jurado
          </a>
          .
        </p>
        <ul className="mt-6 flex flex-wrap gap-3 text-sm font-semibold">
          {["Next.js PWA", "Supabase", "OpenAI GPT", "GPT-4o Vision", "TTS", "RAG + Embeddings", "Agents SDK", "Codex", "Workbox"].map(
            (t) => (
              <li
                key={t}
                className="border border-[var(--color-border)] bg-white px-3 py-2"
              >
                {t}
              </li>
            )
          )}
        </ul>
      </section>
    </>
  );
}
