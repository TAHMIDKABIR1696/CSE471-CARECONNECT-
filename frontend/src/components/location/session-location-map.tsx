"use client";

import { useEffect, useMemo } from "react";
import { divIcon, latLngBounds, type LatLngExpression } from "leaflet";
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from "react-leaflet";

type LocationPoint = {
  lat: number | null;
  lng: number | null;
  time?: string;
};

type SessionLocationMapProps = {
  points: LocationPoint[];
  title: string;
  subtitle: string;
  className?: string;
};

const latestLocationIcon = divIcon({
  className: "",
  html:
    '<div class="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20"><div class="h-4 w-4 rounded-full border-4 border-white bg-emerald-500 shadow-lg"></div></div>',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -12],
});

function MapViewport({ points }: { points: LatLngExpression[] }) {
  const map = useMap();

  useEffect(() => {
    if (points.length === 0) {
      return;
    }

    if (points.length === 1) {
      map.setView(points[0], 15);
      return;
    }

    map.fitBounds(latLngBounds(points), { padding: [28, 28] });
  }, [map, points]);

  return null;
}

export default function SessionLocationMap({
  points,
  title,
  subtitle,
  className = "",
}: SessionLocationMapProps) {
  const validPoints = useMemo<LatLngExpression[]>(() => {
    return points.reduce<LatLngExpression[]>((accumulator, point) => {
      if (typeof point.lat === "number" && typeof point.lng === "number") {
        accumulator.push([point.lat, point.lng]);
      }

      return accumulator;
    }, []);
  }, [points]);

  const latestPoint = validPoints.length > 0 ? validPoints[validPoints.length - 1] : null;
  const center = latestPoint ?? [23.8103, 90.4125];

  return (
    <div className={`overflow-hidden rounded-2xl border border-slate-200 bg-slate-900 ${className}`}>
      <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-slate-950/70 px-4 py-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">{title}</p>
          <p className="text-sm text-slate-200">{subtitle}</p>
        </div>
        <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-300">
          {validPoints.length} point{validPoints.length === 1 ? "" : "s"}
        </span>
      </div>

      <div className="h-[280px] w-full bg-slate-800">
        {validPoints.length > 0 && latestPoint ? (
          <MapContainer center={center} zoom={15} scrollWheelZoom={false} className="h-full w-full">
            <TileLayer
              attribution="&copy; OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapViewport points={validPoints} />
            {validPoints.length > 1 && (
              <Polyline
                positions={validPoints}
                pathOptions={{ color: "#8b5cf6", weight: 4, opacity: 0.9 }}
              />
            )}
            <Marker position={latestPoint} icon={latestLocationIcon}>
              <Popup>Latest session location</Popup>
            </Marker>
          </MapContainer>
        ) : (
          <div className="flex h-full items-center justify-center px-6 text-center text-sm text-slate-300">
            No valid coordinates yet. Map will appear once GPS data is available.
          </div>
        )}
      </div>
    </div>
  );
}