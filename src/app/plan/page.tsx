"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import buildingsData from "@/data/buildings.json";
import type { Building, FamilyPlan, HazardType } from "@/lib/utils";
import { MapPicker, type LocationMode } from "@/components/MapPicker";
import { BuildingTwinCard } from "@/components/BuildingTwinCard";
import { ActionPlanViewer } from "@/components/ActionPlanViewer";
import {
  FacadeVisionAnalyzer,
  type VisionPhotos,
} from "@/components/FacadeVisionAnalyzer";
import { CommunityDashboard } from "@/components/CommunityDashboard";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/components/AuthProvider";
import { savePlanLocal } from "@/lib/offline";
import { Check, Loader2, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { RiskBadge } from "@/components/ui/RiskBadge";

const buildings = buildingsData as Building[];

const steps = [
  "Comunidad",
  "Ubicación",
  "Hogar",
  "Fotos",
  "Plan de acción",
];

export default function PlanPage() {
  const { user } = useAuth();
  const [locationMode, setLocationMode] = useState<LocationMode>("templates");
  const [selected, setSelected] = useState<Building | undefined>(
    buildings.find((b) => b.id === "b-001") ?? buildings[0]
  );
  const [householdSize, setHouseholdSize] = useState(4);
  const [housingType, setHousingType] = useState("departamento");
  const [hasElderly, setHasElderly] = useState(true);
  const [hasChildren, setHasChildren] = useState(true);
  const [hasDisability, setHasDisability] = useState(false);
  const [hazardType, setHazardType] = useState<HazardType>("sismo");
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
  const [sharing, setSharing] = useState(false);
  const [shared, setShared] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dashKey, setDashKey] = useState(0);

  const canGenerate = useMemo(
    () => Boolean(selected && photosReady),
    [selected, photosReady]
  );

  const activeStep = plan ? 4 : photosReady ? 3 : selected ? 2 : 1;

  async function generate() {
    if (!selected || !photos.exterior || !photos.interior) return;
    setLoading(true);
    setError(null);
    setShared(false);
    setPlan(null);
    setVisionAnalysis(null);
    try {
      setLoadingStep("Analizando fotos de la vivienda…");
      const visionRes = await fetch("/api/vision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exterior: photos.exterior,
          interior: photos.interior,
          context: photos.context,
        }),
      });
      const visionData = await visionRes.json();
      if (!visionRes.ok) {
        throw new Error(visionData.error || "Error al analizar las fotos");
      }
      const analysis = String(visionData.analysis || "");
      setVisionAnalysis(analysis);

      setLoadingStep("Generando plan de acción…");
      const res = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          buildingId: selected.id,
          customBuilding: selected.id.startsWith("custom-")
            ? selected
            : undefined,
          householdSize,
          housingType,
          hasElderly,
          hasChildren,
          hasDisability,
          hazardType,
          visionAnalysis: analysis,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error");
      const p = data.plan as FamilyPlan;
      setPlan(p);
      savePlanLocal(p);
      requestAnimationFrame(() => {
        document.getElementById("step-plan")?.scrollIntoView({ behavior: "smooth" });
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo generar el plan");
    } finally {
      setLoading(false);
      setLoadingStep(null);
    }
  }

  async function share() {
    if (!plan) return;
    setSharing(true);
    try {
      await fetch("/api/community", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sectorId: plan.sectorId,
          plan,
          userId: user?.id ?? null,
        }),
      });
      setShared(true);
      setDashKey((k) => k + 1);
      if (navigator.share) {
        try {
          await navigator.share({
            title: "Plan 18:59",
            text: `Plan de resiliencia familiar — ${plan.buildingName}. Punto de encuentro: ${plan.meetingPoint}`,
            url: window.location.origin + "/comunidad",
          });
        } catch {
          /* usuario canceló share nativo */
        }
      }
    } finally {
      setSharing(false);
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <header className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-terracotta)]">
          Evaluación de riesgo familiar
        </p>
        <h1 className="mt-1 font-[family-name:var(--font-display)] text-4xl text-[var(--color-ink)]">
          Cuéntanos sobre tu hogar y recibe tu plan
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--color-muted)]">
          Primero reúne lo necesario (ubicación, hogar y fotos). Al final crea
          tu plan familiar. Puedes usar una vivienda de ejemplo o escribir tu
          dirección.
        </p>
      </header>

      <ol className="mb-8 flex flex-wrap gap-2" aria-label="Progreso del flujo">
        {steps.map((label, i) => (
          <li
            key={label}
            className={cn(
              "rounded-md border px-3 py-1.5 text-xs font-semibold",
              i <= activeStep
                ? "border-[var(--color-terracotta)] bg-[var(--color-paper)] text-[var(--color-ink)]"
                : "border-[var(--color-border)] text-[var(--color-muted)]"
            )}
          >
            {i + 1}. {label}
          </li>
        ))}
      </ol>

      <section aria-labelledby="step-community" className="mb-10">
        <h2 id="step-community" className="mb-4 text-lg font-bold">
          1. Estadísticas de tu comunidad
        </h2>
        <CommunityDashboard
          key={dashKey}
          highlightSectorId={selected?.sectorId ?? plan?.sectorId}
        />
      </section>

      {!user && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-md border border-[var(--color-border)] bg-[var(--color-paper)] p-4 text-sm">
          <p className="text-[var(--color-ink-soft)]">
            Puedes completar la evaluación sin cuenta. Para asociarla a tu hogar
            ante el jurado, entra o usa la cuenta demo.
          </p>
          <Button asChild size="sm" variant="secondary">
            <Link href="/auth?next=/plan">Entrar / Demo</Link>
          </Button>
        </div>
      )}

      {user && (
        <p className="mb-6 text-sm text-[var(--color-resilience)]">
          Sesión: <strong>{user.fullName || user.email}</strong>
        </p>
      )}

      <section aria-labelledby="step-map" className="mb-10">
        <h2 id="step-map" className="mb-3 text-lg font-bold">
          2. Dónde vives
        </h2>

        <div
          className="mb-4 inline-flex rounded-md border border-[var(--color-border)] bg-white p-1"
          role="tablist"
          aria-label="Cómo indicar tu ubicación"
        >
          <button
            type="button"
            role="tab"
            aria-selected={locationMode === "templates"}
            className={cn(
              "rounded px-3 py-2 text-sm font-semibold",
              locationMode === "templates"
                ? "bg-[var(--color-terracotta)] text-white"
                : "text-[var(--color-muted)] hover:text-[var(--color-ink)]"
            )}
            onClick={() => {
              setLocationMode("templates");
              const def =
                buildings.find((b) => b.id === "b-001") ?? buildings[0];
              setSelected(def);
              setPlan(null);
              setVisionAnalysis(null);
              setShared(false);
            }}
          >
            Usar plantilla
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={locationMode === "address"}
            className={cn(
              "rounded px-3 py-2 text-sm font-semibold",
              locationMode === "address"
                ? "bg-[var(--color-terracotta)] text-white"
                : "text-[var(--color-muted)] hover:text-[var(--color-ink)]"
            )}
            onClick={() => {
              setLocationMode("address");
              setSelected(undefined);
              setPlan(null);
              setVisionAnalysis(null);
              setShared(false);
            }}
          >
            Poner mi dirección
          </button>
        </div>

        <p className="mb-3 text-sm text-[var(--color-muted)]">
          {locationMode === "templates"
            ? "Elige una vivienda de ejemplo (con perfil de riesgo listo)."
            : "Busca tu calle o dirección. Solo usamos tu zona aproximada; sin ficha inventada."}
        </p>

        <MapPicker
          mode={locationMode}
          buildings={
            selected && selected.id.startsWith("custom-")
              ? [...buildings.filter((b) => !b.id.startsWith("custom-")), selected]
              : buildings.filter((b) => !b.id.startsWith("custom-"))
          }
          selectedId={selected?.id}
          onSelect={(b) => {
            setSelected(b);
            setPlan(null);
            setVisionAnalysis(null);
            setShared(false);
          }}
        />

        {selected && locationMode === "templates" && !selected.id.startsWith("custom-") && (
          <div className="mt-6">
            <BuildingTwinCard building={selected} />
          </div>
        )}

        {selected && locationMode === "address" && (
          <div className="mt-4 flex items-start gap-3 rounded-md border border-[var(--color-border)] bg-white p-4">
            <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-terracotta)]" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold uppercase tracking-wide text-[var(--color-resilience)]">
                Dirección seleccionada
              </p>
              <p className="font-semibold text-[var(--color-ink)]">{selected.name}</p>
              <p className="text-sm text-[var(--color-muted)]">{selected.address}</p>
              <p className="mt-1 text-xs text-[var(--color-muted)]">
                Zona de referencia para el plan: {selected.sectorName}
              </p>
            </div>
            <RiskBadge level={selected.riskLevel} />
          </div>
        )}
      </section>

      <section className="mb-10" aria-labelledby="step-profile">
        <h2 id="step-profile" className="mb-4 text-lg font-bold">
          3. Perfil del hogar
        </h2>
        <div className="grid gap-4 rounded-lg border border-[var(--color-border)] bg-white p-5 sm:grid-cols-2">
          <label className="text-sm">
            Tamaño del hogar
            <input
              type="number"
              min={1}
              max={20}
              value={householdSize}
              onChange={(e) => setHouseholdSize(Number(e.target.value))}
              className="mt-1 h-11 w-full rounded-md border border-[var(--color-border)] px-3"
            />
          </label>
          <label className="text-sm">
            Tipo de vivienda
            <select
              value={housingType}
              onChange={(e) => setHousingType(e.target.value)}
              className="mt-1 h-11 w-full rounded-md border border-[var(--color-border)] px-3"
            >
              <option value="departamento">Departamento / bloque</option>
              <option value="casa">Casa</option>
              <option value="mixto">Mixto comercio-vivienda</option>
              <option value="informal">Vivienda informal / ampliación</option>
            </select>
          </label>
          <label className="text-sm">
            Amenaza prioritaria
            <select
              value={hazardType}
              onChange={(e) => setHazardType(e.target.value as HazardType)}
              className="mt-1 h-11 w-full rounded-md border border-[var(--color-border)] px-3"
            >
              <option value="sismo">Sismo</option>
              <option value="inundacion">Inundación</option>
              <option value="sequia">Sequía</option>
            </select>
          </label>
          <fieldset className="text-sm">
            <legend className="mb-2">Personas en el hogar</legend>
            <div className="flex flex-wrap gap-4">
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
                  checked={hasChildren}
                  onChange={(e) => setHasChildren(e.target.checked)}
                />
                Niños
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={hasDisability}
                  onChange={(e) => setHasDisability(e.target.checked)}
                />
                Discapacidad
              </label>
            </div>
          </fieldset>
        </div>
      </section>

      <section className="mb-10" aria-labelledby="step-photos">
        <h2 id="step-photos" className="mb-4 text-lg font-bold">
          4. Fotos para evaluar el riesgo
        </h2>
        <FacadeVisionAnalyzer
          onPhotosChange={(p, ready) => {
            setPhotos(p);
            setPhotosReady(ready);
          }}
          analysis={visionAnalysis}
        />
      </section>

      <section className="mb-10" aria-labelledby="step-generate">
        <h2 id="step-generate" className="mb-2 text-lg font-bold">
          5. Generar plan de acción
        </h2>
        <p className="mb-4 max-w-2xl text-sm text-[var(--color-muted)]">
          Con ubicación, hogar y fotos, el agente analiza el riesgo visual y arma
          tu plan vivo (antes / durante / después).
        </p>
        <Button
          onClick={() => void generate()}
          disabled={!canGenerate || loading}
          size="lg"
          variant="resilience"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />{" "}
              {loadingStep || "Generando…"}
            </>
          ) : (
            "Crear mi plan familiar"
          )}
        </Button>
        {!canGenerate && (
          <p className="mt-2 text-xs text-[var(--color-muted)]">
            Completa ubicación + fotos obligatorias (exterior e interior).
          </p>
        )}
        {error && (
          <p className="mt-2 text-sm text-[var(--color-terracotta)]" role="alert">
            {error}
          </p>
        )}
      </section>

      {plan && (
        <section className="mb-10 space-y-6" aria-labelledby="step-plan">
          <h2 id="step-plan" className="text-lg font-bold">
            Tu plan de acción
          </h2>
          {shared && (
            <p className="flex items-center gap-2 rounded-md border border-[var(--color-resilience)] bg-[var(--color-paper)] px-3 py-2 text-sm text-[var(--color-resilience)]">
              <Check className="h-4 w-4" aria-hidden /> Plan compartido — el
              tablero de la comunidad se actualizó arriba.
            </p>
          )}
          <ActionPlanViewer
            plan={plan}
            onShare={() => void share()}
            sharing={sharing}
          />
        </section>
      )}
    </main>
  );
}
