"use client";

import { useEffect, useState } from "react";
import { Card, CardDescription, CardTitle } from "@/components/ui/Card";
import type { SectorStat } from "@/lib/utils";
import * as Progress from "@radix-ui/react-progress";

export function CommunityDashboard({
  initialStats,
  highlightSectorId,
}: {
  initialStats?: SectorStat[];
  highlightSectorId?: string;
}) {
  const [stats, setStats] = useState<SectorStat[]>(initialStats ?? []);
  const [loading, setLoading] = useState(!initialStats);

  async function refresh() {
    try {
      const res = await fetch("/api/community", { cache: "no-store" });
      if (res.ok) {
        const data = (await res.json()) as { sectors: SectorStat[]; overallPercent: number };
        setStats(data.sectors);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!initialStats) void refresh();
    const id = setInterval(() => void refresh(), 8000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const overall =
    stats.length === 0
      ? 0
      : Math.round(
          (stats.reduce((a, s) => a + s.householdsWithPlan, 0) /
            Math.max(
              stats.reduce((a, s) => a + s.totalHouseholds, 0),
              1
            )) *
            100
        );

  return (
    <Card className="community-dashboard" aria-labelledby="community-title">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-resilience)]">
            Capa comunitaria · métrica en vivo
          </p>
          <CardTitle id="community-title" className="mt-1">
            Hogares con plan documentado
          </CardTitle>
          <CardDescription>
            Solo agregados por sector. Sin ubicaciones individuales ni fotos de
            fachada.
          </CardDescription>
        </div>
        <div className="text-right" aria-live="polite">
          <p className="font-[family-name:var(--font-display)] text-5xl text-[var(--color-terracotta)]">
            {loading ? "—" : `${overall}%`}
          </p>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">
            Sectores piloto
          </p>
        </div>
      </div>

      <ul className="mt-6 space-y-4">
        {stats.map((s) => (
          <li
            key={s.sectorId}
            className={
              highlightSectorId === s.sectorId
                ? "rounded-md border-2 border-[var(--color-terracotta)] p-3"
                : "rounded-md border border-[var(--color-border)] p-3"
            }
          >
            <div className="mb-2 flex items-center justify-between gap-2 text-sm">
              <span className="font-semibold text-[var(--color-ink)]">{s.sectorName}</span>
              <span className="tabular-nums text-[var(--color-muted)]">
                {s.householdsWithPlan}/{s.totalHouseholds} · {s.percent}%
              </span>
            </div>
            <Progress.Root
              className="relative h-2 overflow-hidden rounded-full bg-[var(--color-paper)]"
              value={s.percent}
              aria-label={`Porcentaje de hogares con plan en ${s.sectorName}`}
            >
              <Progress.Indicator
                className="h-full bg-[var(--color-resilience)] transition-transform duration-500"
                style={{ transform: `translateX(-${100 - s.percent}%)` }}
              />
            </Progress.Root>
          </li>
        ))}
      </ul>
    </Card>
  );
}
