import buildingsData from "@/data/buildings.json";
import type { Building } from "./utils";

export type PlaceHit = {
  id: string;
  label: string;
  address: string;
  lat: number;
  lng: number;
  source: "google" | "nominatim" | "demo";
};

const buildings = buildingsData as Building[];

function haversineKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const la1 = (a.lat * Math.PI) / 180;
  const la2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Perfil de riesgo de la referencia más cercana. */
export function nearestBuilding(
  lat: number,
  lng: number
): { building: Building; distanceKm: number } {
  let best = buildings[0];
  let bestD = Infinity;
  for (const b of buildings) {
    const d = haversineKm({ lat, lng }, { lat: b.lat, lng: b.lng });
    if (d < bestD) {
      best = b;
      bestD = d;
    }
  }
  return { building: best, distanceKm: bestD };
}

/** Convierte una dirección real en Building usable por el agente. */
export function buildingFromPlace(hit: PlaceHit): Building {
  const { building: near } = nearestBuilding(hit.lat, hit.lng);
  const short =
    hit.label.split(",")[0]?.trim() ||
    hit.address.split(",")[0]?.trim() ||
    "Vivienda en Portoviejo";

  return {
    id: `custom-${hit.lat.toFixed(5)}-${hit.lng.toFixed(5)}`,
    name: short,
    address: hit.address || hit.label,
    sectorId: near.sectorId,
    sectorName: near.sectorName,
    lat: hit.lat,
    lng: hit.lng,
    riskLevel: near.riskLevel,
    buildingType: "ubicacion-geocodificada",
    floors: 0,
    units: 0,
    yearBuilt: 0,
    post16aReportId: `zona-${near.sectorId}`,
    vulnerabilities: [
      `Patrones de zona (${near.sectorName}): ${near.vulnerabilities[0] || "revisar entorno"}`,
      ...near.vulnerabilities.slice(1, 3),
    ],
    safeMeetingPoint: near.safeMeetingPoint,
    evacuationNotes: near.evacuationNotes,
    occupancyProfile: undefined,
    demoNarrative: undefined,
  };
}

export function getGoogleMapsApiKey(): string | null {
  return (
    process.env.GOOGLE_MAPS_API_KEY ||
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
    null
  );
}
