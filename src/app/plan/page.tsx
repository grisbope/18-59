"use client";

import { useMemo, useState } from "react";
import buildingsData from "@/data/buildings.json";
import type { Building, FamilyPlan, HazardType } from "@/lib/utils";
import { MapPicker } from "@/components/MapPicker";
import { BuildingTwinCard } from "@/components/BuildingTwinCard";
import { ActionPlanViewer } from "@/components/ActionPlanViewer";
import { FacadeVisionAnalyzer } from "@/components/FacadeVisionAnalyzer";
import { CommunityDashboard } from "@/components/CommunityDashboard";
import { Button } from "@/components/ui/Button";
import { savePlanLocal } from "@/lib/offline";
import { Loader2 } from "lucide-react";

const buildings = buildingsData as Building[];

export default function PlanPage() {
  const [selected, setSelected] = useState<Building | undefined>(buildings[0]);
  const [householdSize, setHouseholdSize] = useState(4);
  const [housingType, setHousingType] = useState("departamento");
  const [hasElderly, setHasElderly] = useState(true);
  const [hasChildren, setHasChildren] = useState(true);
  const [hasDisability, setHasDisability] = useState(false);
  const [hazardType, setHazardType] = useState<HazardType>("sismo");
  const [plan, setPlan] = useState<FamilyPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dashKey, setDashKey] = useState(0);

  const canGenerate = useMemo(() => Boolean(selected), [selected]);

  async function generate() {
    if (!selected) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          buildingId: selected.id,
          householdSize,
          housingType,
          hasElderly,
          hasChildren,
          hasDisability,
          hazardType,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error");
      const p = data.plan as FamilyPlan;
      setPlan(p);
      savePlanLocal(p);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo generar el plan");
    } finally {
      setLoading(false);
    }
  }

  async function share() {
    if (!plan) return;
    setSharing(true);
    try {
      await fetch("/api/community", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sectorId: plan.sectorId }),
      });
      setDashKey((k) => k + 1);
      if (navigator.share) {
        await navigator.share({
          title: "Plan 18:59",
          text: `Plan de resiliencia familiar — ${plan.buildingName}. Punto de encuentro: ${plan.meetingPoint}`,
          url: window.location.origin + "/comunidad",
        });
      }
    } finally {
      setSharing(false);
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <header className="mb-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-terracotta)]">
          Flujo del agente 18:59
        </p>
        <h1 className="mt-1 font-[family-name:var(--font-display)] text-4xl text-[var(--color-ink)]">
          Generar mi plan
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--color-muted)]">
          Selecciona tu edificio → recupera informe de riesgo → genera plan vivo →
          descarga / escucha / comparte. El plan queda cacheado para modo offline.
        </p>
      </header>

      <section aria-labelledby="step-map" className="mb-10">
        <h2 id="step-map" className="mb-4 text-lg font-bold">
          1. Selecciona tu edificio
        </h2>
        <MapPicker
          buildings={buildings}
          selectedId={selected?.id}
          onSelect={setSelected}
        />
      </section>

      {selected && (
        <section className="mb-10" aria-labelledby="step-twin">
          <h2 id="step-twin" className="mb-4 text-lg font-bold">
            2. Gemelo digital
          </h2>
          <BuildingTwinCard building={selected} />
        </section>
      )}

      <section className="mb-10" aria-labelledby="step-profile">
        <h2 id="step-profile" className="mb-4 text-lg font-bold">
          3. Perfil familiar
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
        <div className="mt-4">
          <Button onClick={() => void generate()} disabled={!canGenerate || loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Generando con agente…
              </>
            ) : (
              "Generar plan de resiliencia"
            )}
          </Button>
          {error && (
            <p className="mt-2 text-sm text-[var(--color-terracotta)]" role="alert">
              {error}
            </p>
          )}
        </div>
      </section>

      {plan && (
        <section className="mb-10 space-y-8" aria-labelledby="step-plan">
          <h2 id="step-plan" className="text-lg font-bold">
            4. Tu plan vivo
          </h2>
          <ActionPlanViewer plan={plan} onShare={() => void share()} sharing={sharing} />
          <FacadeVisionAnalyzer />
          <div>
            <h3 className="mb-3 text-lg font-bold">5. Tablero comunitario</h3>
            <CommunityDashboard key={dashKey} highlightSectorId={plan.sectorId} />
          </div>
        </section>
      )}
    </main>
  );
}
