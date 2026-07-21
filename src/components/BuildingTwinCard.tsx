"use client";

import { Card, CardDescription, CardTitle } from "@/components/ui/Card";
import { RiskBadge } from "@/components/ui/RiskBadge";
import type { Building } from "@/lib/utils";
import { Building2, MapPin, Users } from "lucide-react";

export function BuildingTwinCard({ building }: { building: Building }) {
  return (
    <Card className="building-twin" aria-labelledby={`twin-${building.id}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-terracotta)]">
            Gemelo digital de edificio
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
          <dd className="font-semibold text-[var(--color-ink)]">{building.sectorName}</dd>
        </div>
        <div>
          <dt className="text-[var(--color-muted)]">Pisos</dt>
          <dd className="font-semibold text-[var(--color-ink)]">{building.floors}</dd>
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
          <dd className="font-semibold text-[var(--color-ink)]">{building.yearBuilt}</dd>
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
          <span className="font-semibold text-[var(--color-resilience)]">Punto de encuentro:</span>{" "}
          {building.safeMeetingPoint}
        </p>
        <p className="mt-1 text-sm text-[var(--color-muted)]">{building.evacuationNotes}</p>
      </div>
    </Card>
  );
}
