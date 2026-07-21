"use client";

import { Card, CardDescription, CardTitle } from "@/components/ui/Card";
import { RiskBadge } from "@/components/ui/RiskBadge";
import type { Building } from "@/lib/utils";
import { Building2, MapPin, Users } from "lucide-react";

export function BuildingTwinCard({ building }: { building: Building }) {
  const isCustom = building.id.startsWith("custom-");

  if (isCustom) {
    return (
      <Card className="building-twin" aria-labelledby={`twin-${building.id}`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-terracotta)]">
              Ubicación elegida
            </p>
            <CardTitle id={`twin-${building.id}`} className="mt-1">
              {building.name}
            </CardTitle>
            <CardDescription className="flex items-start gap-1.5">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              {building.address}
            </CardDescription>
          </div>
          <RiskBadge level={building.riskLevel} />
        </div>

        <dl className="mt-5 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-[var(--color-muted)]">Sector de referencia</dt>
            <dd className="font-semibold text-[var(--color-ink)]">
              {building.sectorName}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--color-muted)]">Riesgo estimado de zona</dt>
            <dd className="font-semibold capitalize text-[var(--color-ink)]">
              {building.riskLevel}
            </dd>
          </div>
        </dl>

        <div className="mt-5 rounded-md border border-[var(--color-border)] bg-[var(--color-paper)] p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-[var(--color-ink)]">
            Qué implica para tu plan
          </p>
          <p className="mt-2 text-sm text-[var(--color-ink-soft)]">
            No inventamos pisos ni un informe de este local. Usamos el perfil de
            riesgo del sector más cercano ({building.sectorName}) para armar
            punto de encuentro y acciones familiares.
          </p>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-[var(--color-ink-soft)]">
            {building.vulnerabilities.slice(0, 4).map((v) => (
              <li key={v}>{v}</li>
            ))}
          </ul>
          <p className="mt-3 text-sm">
            <span className="font-semibold text-[var(--color-resilience)]">
              Punto de encuentro sugerido:
            </span>{" "}
            {building.safeMeetingPoint}
          </p>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            {building.evacuationNotes}
          </p>
          <p className="mt-3 border-t border-[var(--color-border)] pt-2 text-xs text-[var(--color-muted)]">
            Estimación por zona. No es un peritaje del shopping ni de tu
            vivienda; no sustituye evaluación técnica oficial.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="building-twin" aria-labelledby={`twin-${building.id}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-terracotta)]">
            Perfil de vivienda de referencia
          </p>
          <CardTitle id={`twin-${building.id}`} className="mt-1">
            {building.name}
          </CardTitle>
          <CardDescription className="flex items-start gap-1.5">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            {building.address}
          </CardDescription>
        </div>
        <RiskBadge level={building.riskLevel} />
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        <div>
          <dt className="text-[var(--color-muted)]">Sector</dt>
          <dd className="font-semibold text-[var(--color-ink)]">
            {building.sectorName}
          </dd>
        </div>
        <div>
          <dt className="text-[var(--color-muted)]">Pisos</dt>
          <dd className="font-semibold text-[var(--color-ink)]">
            {building.floors}
          </dd>
        </div>
        <div>
          <dt className="text-[var(--color-muted)]">Unidades</dt>
          <dd className="font-semibold text-[var(--color-ink)] flex items-center gap-1">
            <Users className="h-3.5 w-3.5" aria-hidden />
            {building.units}
          </dd>
        </div>
        <div>
          <dt className="text-[var(--color-muted)]">Año</dt>
          <dd className="font-semibold text-[var(--color-ink)]">
            {building.yearBuilt}
          </dd>
        </div>
      </dl>

      <div className="mt-5 rounded-md border border-[var(--color-border)] bg-[var(--color-paper)] p-4">
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-[var(--color-ink)]">
          <Building2 className="h-4 w-4" aria-hidden />
          Informe post-16A · {building.post16aReportId}
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[var(--color-ink-soft)]">
          {building.vulnerabilities.map((v) => (
            <li key={v}>{v}</li>
          ))}
        </ul>
        <p className="mt-3 text-sm">
          <span className="font-semibold text-[var(--color-resilience)]">
            Punto de encuentro:
          </span>{" "}
          {building.safeMeetingPoint}
        </p>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          {building.evacuationNotes}
        </p>
        {building.occupancyProfile && (
          <p className="mt-2 text-sm text-[var(--color-ink-soft)]">
            <span className="font-semibold">Ocupación:</span>{" "}
            {building.occupancyProfile}
          </p>
        )}
        {building.demoNarrative && (
          <p className="mt-2 border-t border-[var(--color-border)] pt-2 text-xs italic text-[var(--color-muted)]">
            {building.demoNarrative}
          </p>
        )}
      </div>
    </Card>
  );
}
