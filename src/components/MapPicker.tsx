"use client";

import { useEffect, useState, type ComponentType } from "react";
import type { Building } from "@/lib/utils";
import { RiskBadge } from "@/components/ui/RiskBadge";
import { cn } from "@/lib/utils";
import { Loader2, MapPin, Search } from "lucide-react";

type PlaceHit = {
  id: string;
  label: string;
  address: string;
  lat: number;
  lng: number;
  source: "google" | "nominatim" | "demo";
};

export type LocationMode = "templates" | "address";

/** Selector: plantillas de referencia O dirección real. */
export function MapPicker({
  buildings,
  selectedId,
  onSelect,
  mode,
}: {
  buildings: Building[];
  selectedId?: string;
  onSelect: (b: Building) => void;
  mode: LocationMode;
}) {
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<PlaceHit[]>([]);
  const [provider, setProvider] = useState<string>("demo");
  const [searching, setSearching] = useState(false);
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [MapView, setMapView] = useState<ComponentType<{
    buildings: Building[];
    selectedId?: string;
    onSelect: (b: Building) => void;
  }> | null>(null);

  useEffect(() => {
    void import("./MapPickerLeaflet").then((m) =>
      setMapView(() => m.MapPickerLeaflet)
    );
  }, []);

  // Reset search when switching mode
  useEffect(() => {
    setQuery("");
    setHits([]);
    setSearchError(null);
  }, [mode]);

  useEffect(() => {
    if (mode !== "address") return;
    const q = query.trim();
    const ctrl = new AbortController();
    const t = setTimeout(() => {
      void (async () => {
        if (q.length < 2) {
          setHits([]);
          setProvider("nominatim");
          return;
        }
        setSearching(true);
        setSearchError(null);
        try {
          const res = await fetch(`/api/places?q=${encodeURIComponent(q)}`, {
            signal: ctrl.signal,
            cache: "no-store",
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Error de búsqueda");
          const places = ((data.places as PlaceHit[]) || []).filter(
            (p) => p.source !== "demo"
          );
          setHits(places);
          setProvider(
            places[0]?.source === "google" ? "google" : "nominatim"
          );
        } catch (e) {
          if ((e as Error).name === "AbortError") return;
          setSearchError(
            e instanceof Error ? e.message : "No se pudo buscar"
          );
        } finally {
          setSearching(false);
        }
      })();
    }, 350);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [query, mode]);

  async function pickHit(hit: PlaceHit) {
    setResolvingId(hit.id);
    setSearchError(null);
    try {
      const res = await fetch("/api/places", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(hit),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo ubicar");
      onSelect(data.building as Building);
    } catch (e) {
      setSearchError(e instanceof Error ? e.message : "Error al seleccionar");
    } finally {
      setResolvingId(null);
    }
  }

  const mapBuildings =
    mode === "templates"
      ? buildings.filter((b) => !b.id.startsWith("custom-"))
      : buildings;

  if (mode === "templates") {
    return (
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="overflow-hidden rounded-lg border border-[var(--color-border)] bg-white">
          <div className="border-b border-[var(--color-border)] bg-[var(--color-paper)] px-3 py-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">
            Mapa · plantillas Portoviejo
          </div>
          <div className="h-72 w-full bg-[var(--color-paper)]">
            {MapView ? (
              <MapView
                buildings={mapBuildings}
                selectedId={selectedId}
                onSelect={onSelect}
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-[var(--color-muted)]">
                Cargando mapa…
              </div>
            )}
          </div>
        </div>
        <ul
          className="max-h-[22rem] space-y-2 overflow-y-auto pr-1"
          role="listbox"
          aria-label="Plantillas de vivienda"
        >
          {mapBuildings.map((b) => (
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
                    <p className="font-semibold text-[var(--color-ink)]">
                      {b.name}
                    </p>
                    <p className="text-xs text-[var(--color-muted)]">
                      {b.address}
                    </p>
                  </div>
                  <RiskBadge level={b.riskLevel} />
                </div>
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="overflow-hidden rounded-lg border border-[var(--color-border)] bg-white">
        <div className="border-b border-[var(--color-border)] bg-[var(--color-paper)] px-3 py-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">
          Mapa · tu dirección
        </div>
        <div className="h-72 w-full bg-[var(--color-paper)]">
          {MapView ? (
            <MapView
              buildings={mapBuildings}
              selectedId={selectedId}
              onSelect={onSelect}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-[var(--color-muted)]">
              Cargando mapa…
            </div>
          )}
        </div>
      </div>

      <div>
        <label
          htmlFor="building-search"
          className="mb-1.5 block text-sm font-semibold text-[var(--color-ink)]"
        >
          Escribe tu calle o dirección
        </label>
        <div className="relative mb-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-muted)]"
            aria-hidden
          />
          <input
            id="building-search"
            type="search"
            placeholder="Ej. Pedro Gual, Sucre y Olmedo…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-11 w-full rounded-md border border-[var(--color-border)] bg-white py-2 pl-9 pr-10 text-sm outline-none focus:ring-2 focus:ring-[var(--color-terracotta)]"
            autoComplete="street-address"
          />
          {searching && (
            <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-[var(--color-muted)]" />
          )}
        </div>
        <p className="mb-3 text-xs text-[var(--color-muted)]">
          {provider === "google"
            ? "Google Maps · Portoviejo"
            : "Calles de Portoviejo (mapa abierto)"}
        </p>

        <ul
          className="max-h-72 space-y-2 overflow-y-auto pr-1"
          role="listbox"
          aria-label="Resultados de dirección"
        >
          {hits.map((h) => (
            <li key={h.id}>
              <button
                type="button"
                role="option"
                aria-selected={false}
                disabled={resolvingId === h.id}
                onClick={() => void pickHit(h)}
                className="w-full rounded-md border border-[var(--color-border)] p-3 text-left hover:border-[var(--color-ink-soft)]"
              >
                <div className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-terracotta)]" />
                  <div className="min-w-0">
                    <p className="font-semibold text-[var(--color-ink)]">
                      {resolvingId === h.id ? "Ubicando…" : h.label}
                    </p>
                    <p className="text-xs text-[var(--color-muted)]">
                      {h.address}
                    </p>
                  </div>
                </div>
              </button>
            </li>
          ))}
          {!searching && query.trim().length >= 2 && hits.length === 0 && (
            <li className="rounded-md border border-dashed border-[var(--color-border)] p-4 text-sm text-[var(--color-muted)]">
              No encontramos esa calle. Prueba el nombre de la vía + Portoviejo.
            </li>
          )}
          {query.trim().length < 2 && (
            <li className="rounded-md border border-dashed border-[var(--color-border)] p-4 text-sm text-[var(--color-muted)]">
              Escribe al menos 2 letras para buscar tu dirección.
            </li>
          )}
        </ul>
        {searchError && (
          <p className="mt-2 text-sm text-[var(--color-terracotta)]" role="alert">
            {searchError}
          </p>
        )}
      </div>
    </div>
  );
}
