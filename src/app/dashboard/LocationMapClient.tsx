
"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

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

const LocationMap = dynamic<LocationMapProps>(
  () => import("./LocationMap"),
  {
    ssr: false,
    loading: () => (
      <div className="h-[450px] rounded-2xl bg-zinc-950 flex items-center justify-center text-gray-500">
        Cargando mapa...
      </div>
    ),
  }
);

type LocationMapClientProps = {
  locations: Location[];
};

export default function LocationMapClient({
  locations,
}: LocationMapClientProps) {
  const [selectedLocationId, setSelectedLocationId] =
    useState<string | null>(null);

  return (
    <LocationMap
      locations={locations}
      selectedLocationId={selectedLocationId}
      onSelectLocation={setSelectedLocationId}
    />
  );
}

