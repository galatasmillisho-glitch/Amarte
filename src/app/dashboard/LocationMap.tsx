
"use client";

import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";

import L from "leaflet";
import { useEffect } from "react";

type Location = {
  id: string;
  latitude: number;
  longitude: number;
  accuracy: number | null;
  createdAt: string;
};

type LocationMapProps = {
  locations: Location[];
  selectedLocationId: string | null;
  onSelectLocation: (id: string) => void;
};

const markerIcon = L.icon({
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",

  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",

  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",

  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function MapController({
  locations,
  selectedLocationId,
}: {
  locations: Location[];
  selectedLocationId: string | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (!selectedLocationId) {
      return;
    }

    const selectedLocation = locations.find(
      (location) => location.id === selectedLocationId
    );

    if (!selectedLocation) {
      return;
    }

    map.flyTo(
      [
        selectedLocation.latitude,
        selectedLocation.longitude,
      ],
      17,
      {
        duration: 1.2,
      }
    );
  }, [selectedLocationId, locations, map]);

  return null;
}

export default function LocationMap({
  locations,
  selectedLocationId,
  onSelectLocation,
}: LocationMapProps) {
  if (locations.length === 0) {
    return (
      <div className="flex h-[450px] items-center justify-center rounded-2xl bg-zinc-950 text-gray-500">
        Todavía no hay ubicaciones para mostrar.
      </div>
    );
  }

  const latestLocation = locations[0];

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-800">
      <MapContainer
        center={[
          latestLocation.latitude,
          latestLocation.longitude,
        ]}
        zoom={15}
        scrollWheelZoom={true}
        className="h-[450px] w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapController
          locations={locations}
          selectedLocationId={selectedLocationId}
        />

        {locations.map((location) => (
          <Marker
            key={location.id}
            position={[
              location.latitude,
              location.longitude,
            ]}
            icon={markerIcon}
            eventHandlers={{
              click: () => {
                onSelectLocation(location.id);
              },
            }}
          >
            <Popup>
              <div className="text-sm">
                <strong>
                  Ubicación compartida
                </strong>

                <div className="mt-2">
                  📍 {location.latitude.toFixed(6)}
                  <br />
                  📍 {location.longitude.toFixed(6)}
                </div>

                <div className="mt-2">
                  🕐{" "}
                  {new Date(
                    location.createdAt
                  ).toLocaleString("es-PE")}
                </div>

                {location.accuracy !== null && (
                  <div className="mt-1">
                    🎯 Precisión: ±
                    {Math.round(location.accuracy)} m
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
