import { NextResponse } from "next/server";
import buildingsData from "@/data/buildings.json";
import {
  buildingFromPlace,
  getGoogleMapsApiKey,
  type PlaceHit,
} from "@/lib/geo";
import type { Building } from "@/lib/utils";

export const runtime = "nodejs";

const PORTOVIEJO = { lat: -1.0547, lng: -80.4545 };
const demoBuildings = buildingsData as Building[];

async function searchGoogle(query: string): Promise<PlaceHit[]> {
  const key = getGoogleMapsApiKey();
  if (!key) return [];

  const autoRes = await fetch(
    "https://places.googleapis.com/v1/places:autocomplete",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": key,
      },
      body: JSON.stringify({
        input: query,
        includedRegionCodes: ["ec"],
        languageCode: "es",
        locationBias: {
          circle: {
            center: {
              latitude: PORTOVIEJO.lat,
              longitude: PORTOVIEJO.lng,
            },
            radius: 30000.0,
          },
        },
      }),
    }
  );
  const autoJson = (await autoRes.json()) as {
    error?: { message?: string };
    suggestions?: Array<{
      placePrediction?: {
        placeId?: string;
        text?: { text?: string };
        structuredFormat?: {
          mainText?: { text?: string };
          secondaryText?: { text?: string };
        };
      };
    }>;
  };

  if (!autoRes.ok || autoJson.error) {
    const geoUrl = new URL("https://maps.googleapis.com/maps/api/geocode/json");
    geoUrl.searchParams.set(
      "address",
      query.toLowerCase().includes("portoviejo")
        ? query
        : `${query}, Portoviejo, Ecuador`
    );
    geoUrl.searchParams.set("components", "country:EC");
    geoUrl.searchParams.set("language", "es");
    geoUrl.searchParams.set("key", key);
    const geoRes = await fetch(geoUrl);
    const geoJson = (await geoRes.json()) as {
      status: string;
      results?: Array<{
        place_id: string;
        formatted_address: string;
        geometry: { location: { lat: number; lng: number } };
      }>;
    };
    if (geoJson.status !== "OK" || !geoJson.results?.length) return [];
    return geoJson.results
      .filter((r) =>
        r.formatted_address.toLowerCase().includes("portoviejo")
      )
      .slice(0, 8)
      .map((r) => ({
        id: `google-${r.place_id}`,
        label: r.formatted_address,
        address: r.formatted_address,
        lat: r.geometry.location.lat,
        lng: r.geometry.location.lng,
        source: "google" as const,
      }));
  }

  const preds = (autoJson.suggestions || [])
    .map((s) => s.placePrediction)
    .filter(Boolean)
    .slice(0, 6);

  const detailed: PlaceHit[] = [];
  for (const p of preds) {
    if (!p?.placeId) continue;
    const detRes = await fetch(
      `https://places.googleapis.com/v1/places/${encodeURIComponent(p.placeId)}`,
      {
        headers: {
          "X-Goog-Api-Key": key,
          "X-Goog-FieldMask":
            "id,formattedAddress,location,displayName,shortFormattedAddress",
        },
      }
    );
    if (!detRes.ok) continue;
    const det = (await detRes.json()) as {
      id?: string;
      formattedAddress?: string;
      shortFormattedAddress?: string;
      displayName?: { text?: string };
      location?: { latitude?: number; longitude?: number };
    };
    if (
      typeof det.location?.latitude !== "number" ||
      typeof det.location?.longitude !== "number"
    ) {
      continue;
    }
    const label =
      det.displayName?.text ||
      p.structuredFormat?.mainText?.text ||
      det.shortFormattedAddress ||
      det.formattedAddress ||
      p.text?.text ||
      "Lugar";
    detailed.push({
      id: `google-${det.id || p.placeId}`,
      label,
      address: det.formattedAddress || p.text?.text || label,
      lat: det.location.latitude,
      lng: det.location.longitude,
      source: "google",
    });
  }
  return detailed;
}

async function searchNominatim(query: string): Promise<PlaceHit[]> {
  const q = query.toLowerCase().includes("portoviejo")
    ? query
    : `${query}, Portoviejo, Ecuador`;
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", q);
  url.searchParams.set("format", "json");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("limit", "8");
  url.searchParams.set("countrycodes", "ec");

  const res = await fetch(url.toString(), {
    headers: {
      "User-Agent": "18-59-resilience/1.0 (https://18-59.grisbope.com)",
      Accept: "application/json",
    },
  });
  if (!res.ok) return [];
  const rows = (await res.json()) as Array<{
    place_id: number;
    display_name: string;
    lat: string;
    lon: string;
    name?: string;
  }>;

  return rows
    .filter((r) => r.display_name.toLowerCase().includes("portoviejo"))
    .map((r) => ({
      id: `osm-${r.place_id}`,
      label: r.name || r.display_name.split(",")[0] || r.display_name,
      address: r.display_name,
      lat: Number(r.lat),
      lng: Number(r.lon),
      source: "nominatim" as const,
    }));
}

function searchDemo(query: string): PlaceHit[] {
  const q = query.trim().toLowerCase();
  return demoBuildings
    .filter(
      (b) =>
        !q ||
        b.name.toLowerCase().includes(q) ||
        b.address.toLowerCase().includes(q) ||
        b.sectorName.toLowerCase().includes(q)
    )
    .slice(0, 6)
    .map((b) => ({
      id: b.id,
      label: b.name,
      address: b.address,
      lat: b.lat,
      lng: b.lng,
      source: "demo" as const,
    }));
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") || "").trim();
    if (q.length < 2) {
      return NextResponse.json({
        places: searchDemo(""),
        provider: "demo",
        googleConfigured: Boolean(getGoogleMapsApiKey()),
      });
    }

    let places = await searchGoogle(q);
    let provider: "google" | "nominatim" | "demo" = "google";

    if (!places.length) {
      places = await searchNominatim(q);
      provider = places.length ? "nominatim" : "demo";
    }
    if (!places.length) {
      places = searchDemo(q);
      provider = "demo";
    } else {
      const demoHits = searchDemo(q).filter(
        (d) => !places.some((p) => p.id === d.id)
      );
      places = [...demoHits.slice(0, 2), ...places].slice(0, 10);
    }

    return NextResponse.json({
      places,
      provider,
      googleConfigured: Boolean(getGoogleMapsApiKey()),
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error buscando lugares" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<PlaceHit>;
    if (
      typeof body.lat !== "number" ||
      typeof body.lng !== "number" ||
      !body.address
    ) {
      return NextResponse.json(
        { error: "lat, lng y address requeridos" },
        { status: 400 }
      );
    }
    const hit: PlaceHit = {
      id: body.id || `custom-${body.lat}-${body.lng}`,
      label: body.label || body.address,
      address: body.address,
      lat: body.lat,
      lng: body.lng,
      source: body.source || "nominatim",
    };
    return NextResponse.json({ building: buildingFromPlace(hit) });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error" },
      { status: 500 }
    );
  }
}
