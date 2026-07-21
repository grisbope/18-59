"use client";

import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import type { Building, RiskLevel } from "@/lib/utils";
import { useEffect } from "react";
import "leaflet/dist/leaflet.css";

const colors: Record<RiskLevel, string> = {
  alto: "#C45C3E",
  medio: "#4A4A4A",
  bajo: "#2F6B4F",
};

function FitBounds({ buildings }: { buildings: Building[] }) {
  const map = useMap();
  useEffect(() => {
    if (!buildings.length) return;
    const lats = buildings.map((b) => b.lat);
    const lngs = buildings.map((b) => b.lng);
    map.fitBounds(
      [
        [Math.min(...lats) - 0.01, Math.min(...lngs) - 0.01],
        [Math.max(...lats) + 0.01, Math.max(...lngs) + 0.01],
      ],
      { padding: [20, 20] }
    );
  }, [buildings, map]);
  return null;
}

export function MapPickerLeaflet({
  buildings,
  selectedId,
  onSelect,
}: {
  buildings: Building[];
  selectedId?: string;
  onSelect: (b: Building) => void;
}) {
  return (
    <MapContainer
      center={[-1.0547, -80.4545]}
      zoom={14}
      className="h-full w-full"
      scrollWheelZoom={false}
      attributionControl
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitBounds buildings={buildings} />
      {buildings.map((b) => (
        <CircleMarker
          key={b.id}
          center={[b.lat, b.lng]}
          radius={selectedId === b.id ? 12 : 8}
          pathOptions={{
            color: "#1A1A1A",
            weight: selectedId === b.id ? 2 : 1,
            fillColor: colors[b.riskLevel],
            fillOpacity: 0.85,
          }}
          eventHandlers={{ click: () => onSelect(b) }}
        >
          <Popup>
            <strong>{b.name}</strong>
            <br />
            Riesgo {b.riskLevel}
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
