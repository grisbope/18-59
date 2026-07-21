"use client";

import { useEffect, useMemo, useState, type ComponentType } from "react";
import type { Building } from "@/lib/utils";
import { RiskBadge } from "@/components/ui/RiskBadge";
import { cn } from "@/lib/utils";

/** Selector de edificios con mapa simplificado (sin dependencia pesada en SSR). */
export function MapPicker({
  buildings,
  selectedId,
  onSelect,
}: {
  buildings: Building[];
  selectedId?: string;
  onSelect: (b: Building) => void;
}) {
  const [query, setQuery] = useState("");
  const [MapView, setMapView] = useState<ComponentType<{
    buildings: Building[];
    selectedId?: string;
    onSelect: (b: Building) => void;
  }> | null>(null);

  useEffect(() => {
    void import("./MapPickerLeaflet").then((m) => setMapView(() => m.MapPickerLeaflet));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return buildings;
    return buildings.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        b.address.toLowerCase().includes(q) ||
        b.sectorName.toLowerCase().includes(q)
    );
  }, [buildings, query]);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="overflow-hidden rounded-lg border border-[var(--color-border)] bg-white">
        <div className="border-b border-[var(--color-border)] bg-[var(--color-paper)] px-3 py-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">
          Mapa interactivo · Portoviejo
        </div>
        <div className="h-72 w-full bg-[var(--color-paper)]">
          {MapView ? (
            <MapView buildings={buildings} selectedId={selectedId} onSelect={onSelect} />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-[var(--color-muted)]">
              Cargando mapa…
            </div>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="building-search" className="sr-only">
          Buscar edificio
        </label>
        <input
          id="building-search"
          type="search"
          placeholder="Buscar por dirección, bloque o sector…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="mb-3 h-11 w-full rounded-md border border-[var(--color-border)] bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-[var(--color-terracotta)]"
        />
        <ul className="max-h-72 space-y-2 overflow-y-auto pr-1" role="listbox" aria-label="Edificios">
          {filtered.map((b) => (
            <li key={b.id}>
              <button
                type="button"
                role="option"
                aria-selected={selectedId === b.id}
                onClick={() => onSelect(b)}
                className={cn(
                  "w-full rounded-md border p-3 text-left transition-colors",
                  selectedId === b.id
                    ? "border-[var(--color-terracotta)] bg-[var(--color-paper)]"
                    : "border-[var(--color-border)] hover:border-[var(--color-ink-soft)]"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-[var(--color-ink)]">{b.name}</p>
                    <p className="text-xs text-[var(--color-muted)]">{b.address}</p>
                  </div>
                  <RiskBadge level={b.riskLevel} />
                </div>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
