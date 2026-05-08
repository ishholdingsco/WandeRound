"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { GeoJSONData } from "@/types";

const COLORS = [
  "#2563eb",
  "#dc2626",
  "#16a34a",
  "#d97706",
  "#7c3aed",
  "#0891b2",
  "#be185d",
  "#65a30d",
  "#9333ea",
  "#0f766e",
];

function FitBounds({ geojson }: { geojson: GeoJSONData }) {
  const map = useMap();
  useEffect(() => {
    try {
      const layer = L.geoJSON(geojson as Parameters<typeof L.geoJSON>[0]);
      const bounds = layer.getBounds();
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [24, 24], maxZoom: 15 });
      }
    } catch {
      // ignore invalid bounds
    }
  }, [geojson, map]);
  return null;
}

export default function MapView({ geojson }: { geojson: GeoJSONData }) {
  const clusterColor = (clust: number) =>
    COLORS[Math.abs(clust ?? 0) % COLORS.length];

  return (
    <div className="w-full h-72 rounded-xl overflow-hidden border border-zinc-100 mt-3 isolate relative z-0">
      <MapContainer
        center={[0, 0]}
        zoom={2}
        style={{ width: "100%", height: "100%" }}
        scrollWheelZoom={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          maxZoom={20}
          subdomains="abcd"
        />
        <GeoJSON
          data={geojson as Parameters<typeof L.geoJSON>[0]}
          pointToLayer={(feature, latlng) => {
            const color = clusterColor(
              feature.properties?.clust as number
            );
            return L.circleMarker(latlng, {
              radius: 6,
              fillColor: color,
              color: "#ffffff",
              weight: 1.5,
              opacity: 1,
              fillOpacity: 0.85,
            });
          }}
          style={(feature) => {
            const color = clusterColor(
              feature?.properties?.clust as number
            );
            return { color, weight: 2, opacity: 0.8, fillOpacity: 0.35 };
          }}
        />
        <FitBounds geojson={geojson} />
      </MapContainer>
    </div>
  );
}
