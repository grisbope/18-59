"use client";

import { useMemo, useState } from "react";
import parksData from "@/data/parks.json";
import type { FamilyPlan } from "@/lib/utils";
import type { Park } from "@/lib/parks";
import {
  FacadeVisionAnalyzer,
  type VisionPhotos,
} from "@/components/FacadeVisionAnalyzer";
import { ActionPlanViewer } from "@/components/ActionPlanViewer";
import { Button } from "@/components/ui/Button";
import { RiskBadge } from "@/components/ui/RiskBadge";
import { savePlanLocal } from "@/lib/offline";
import { cn } from "@/lib/utils";
import { Loader2, Trees } from "lucide-react";

const parks = parksData as Park[];

export default function PortoParquesPage() {
  const [park, setPark] = useState<Park>(parks[0]);
  const [eventName, setEventName] = useState("Feria comunitaria");
  const [eventType, setEventType] = useState("feria");
  const [attendees, setAttendees] = useState(80);
  const [durationHours, setDurationHours] = useState(3);
  const [hasChildren, setHasChildren] = useState(true);
  const [hasElderly, setHasElderly] = useState(true);
  const [hasDisability, setHasDisability] = useState(false);
  const [organizerContact, setOrganizerContact] = useState("");
  const [photos, setPhotos] = useState<VisionPhotos>({
    exterior: null,
    interior: null,
    context: [],
  });
  const [photosReady, setPhotosReady] = useState(false);
  const [plan, setPlan] = useState<FamilyPlan | null>(null);
  const [visionAnalysis, setVisionAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canGenerate = useMemo(
    () => Boolean(park && photosReady && eventName.trim()),
    [park, photosReady, eventName]
  );

  async function generate() {
    if (!park || !photos.exterior) return;
    setLoading(true);
    setError(null);
    setPlan(null);
    setVisionAnalysis(null);
    try {
      setLoadingStep("Revisando fotos del parque…");
      const visionRes = await fetch("/api/vision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "park",
          exterior: photos.exterior,
          interior: photos.interior,
          context: photos.context,
        }),
      });
      const visionData = await visionRes.json();
      if (!visionRes.ok) {
        throw new Error(visionData.error || "Error al analizar fotos");
      }
      const analysis = String(visionData.analysis || "");
      setVisionAnalysis(analysis);

      setLoadingStep("Armando plan del evento…");
      const res = await fetch("/api/park-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parkId: park.id,
          eventName,
          eventType,
          attendees,
          durationHours,
          hasChildren,
          hasElderly,
          hasDisability,
          organizerContact,
          visionAnalysis: analysis,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error");
      const p = data.plan as FamilyPlan;
      setPlan(p);
      savePlanLocal(p);
      requestAnimationFrame(() => {
        document
          .getElementById("park-plan-result")
          ?.scrollIntoView({ behavior: "smooth" });
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo generar el plan");
    } finally {
      setLoading(false);
      setLoadingStep(null);
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <header className="mb-8">
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-terracotta)]">
          <Trees className="h-3.5 w-3.5" /> 18:59 PortoParques
        </p>
        <h1 className="mt-1 font-[family-name:var(--font-display)] text-4xl text-[var(--color-ink)]">
          Plan de acción para eventos en parques
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--color-muted)]">
          Elige el parque, describe el evento, sube fotos del lugar y del
          entorno, y genera un plan claro para organizadores y asistentes.
        </p>
      </header>

      <section className="mb-10" aria-labelledby="park-pick">
        <h2 id="park-pick" className="mb-3 text-lg font-bold">
          1. Parque
        </h2>
        <ul className="grid gap-2 sm:grid-cols-2">
          {parks.map((p) => (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => {
                  setPark(p);
                  setPlan(null);
                  setVisionAnalysis(null);
                }}
                className={cn(
                  "w-full rounded-md border p-3 text-left",
                  park.id === p.id
                    ? "border-[var(--color-terracotta)] bg-[var(--color-paper)]"
                    : "border-[var(--color-border)] hover:border-[var(--color-ink-soft)]"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold">{p.name}</p>
                    <p className="text-xs text-[var(--color-muted)]">
                      {p.address}
                    </p>
                  </div>
                  <RiskBadge level={p.riskLevel} />
                </div>
              </button>
            </li>
          ))}
        </ul>
        <div className="mt-3 rounded-md border border-[var(--color-border)] bg-[var(--color-paper)] p-3 text-sm text-[var(--color-ink-soft)]">
          <p>
            <strong>Punto de encuentro sugerido:</strong> {park.safeMeetingPoint}
          </p>
          <p className="mt-1">{park.notes}</p>
        </div>
      </section>

      <section className="mb-10" aria-labelledby="event-profile">
        <h2 id="event-profile" className="mb-3 text-lg font-bold">
          2. Datos del evento
        </h2>
        <div className="grid gap-4 rounded-lg border border-[var(--color-border)] bg-white p-5 sm:grid-cols-2">
          <label className="text-sm">
            Nombre del evento
            <input
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              className="mt-1 h-11 w-full rounded-md border border-[var(--color-border)] px-3"
            />
          </label>
          <label className="text-sm">
            Tipo
            <select
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              className="mt-1 h-11 w-full rounded-md border border-[var(--color-border)] px-3"
            >
              <option value="feria">Feria / mercado</option>
              <option value="cultural">Cultural / concierto</option>
              <option value="deportivo">Deportivo</option>
              <option value="comunitario">Acto comunitario</option>
              <option value="conmemorativo">Conmemorativo</option>
            </select>
          </label>
          <label className="text-sm">
            Asistentes estimados
            <input
              type="number"
              min={1}
              max={5000}
              value={attendees}
              onChange={(e) => setAttendees(Number(e.target.value))}
              className="mt-1 h-11 w-full rounded-md border border-[var(--color-border)] px-3"
            />
          </label>
          <label className="text-sm">
            Duración (horas)
            <input
              type="number"
              min={1}
              max={24}
              value={durationHours}
              onChange={(e) => setDurationHours(Number(e.target.value))}
              className="mt-1 h-11 w-full rounded-md border border-[var(--color-border)] px-3"
            />
          </label>
          <label className="text-sm sm:col-span-2">
            Contacto del organizador (opcional)
            <input
              value={organizerContact}
              onChange={(e) => setOrganizerContact(e.target.value)}
              placeholder="Teléfono o WhatsApp"
              className="mt-1 h-11 w-full rounded-md border border-[var(--color-border)] px-3"
            />
          </label>
          <fieldset className="text-sm sm:col-span-2">
            <legend className="mb-2">Quién asiste</legend>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={hasChildren}
                  onChange={(e) => setHasChildren(e.target.checked)}
                />
                Niños
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={hasElderly}
                  onChange={(e) => setHasElderly(e.target.checked)}
                />
                Adultos mayores
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={hasDisability}
                  onChange={(e) => setHasDisability(e.target.checked)}
                />
                Personas con discapacidad
              </label>
            </div>
          </fieldset>
        </div>
      </section>

      <section className="mb-10" aria-labelledby="park-photos">
        <h2 id="park-photos" className="mb-3 text-lg font-bold">
          3. Fotos del lugar y del entorno
        </h2>
        <FacadeVisionAnalyzer
          variant="park"
          onPhotosChange={(p, ready) => {
            setPhotos(p);
            setPhotosReady(ready);
          }}
          analysis={visionAnalysis}
        />
      </section>

      <section className="mb-10">
        <h2 className="mb-2 text-lg font-bold">4. Generar plan del evento</h2>
        <Button
          variant="resilience"
          size="lg"
          disabled={!canGenerate || loading}
          onClick={() => void generate()}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />{" "}
              {loadingStep || "Generando…"}
            </>
          ) : (
            "Crear plan PortoParques"
          )}
        </Button>
        {!canGenerate && (
          <p className="mt-2 text-xs text-[var(--color-muted)]">
            Completa parque, nombre del evento y fotos mínimas.
          </p>
        )}
        {error && (
          <p className="mt-2 text-sm text-[var(--color-terracotta)]" role="alert">
            {error}
          </p>
        )}
      </section>

      {plan && (
        <section id="park-plan-result" className="mb-10">
          <h2 className="mb-4 text-lg font-bold">Plan del evento</h2>
          <ActionPlanViewer plan={plan} />
        </section>
      )}
    </main>
  );
}
