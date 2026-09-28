
"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";

type Location = {
  id: string;
  latitude: number;
  longitude: number;
  accuracy: number | null;
  createdAt: string;
};

type LocationDashboardClientProps = {
  locations: Location[];
};

const LocationMap = dynamic(
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

export default function LocationDashboardClient({
  locations,
}: LocationDashboardClientProps) {
  const router = useRouter();
  const [selectedLocationId, setSelectedLocationId] =
    useState<string | null>(null);
  const [deletingLocationId, setDeletingLocationId] =
    useState<string | null>(null);
  const [requestingLocation, setRequestingLocation] =
    useState(false);
  const [locationMessage, setLocationMessage] = useState("");

  async function handleRequestCurrentLocation() {
    if (!navigator.geolocation) {
      setLocationMessage(
        "Tu navegador no permite acceder a la geolocalización."
      );
      return;
    }

    setRequestingLocation(true);
    setLocationMessage("Solicitando tu ubicación...");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const response = await fetch("/api/location", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
            }),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(
              data.error || "No se pudo guardar tu ubicación."
            );
          }

          setLocationMessage(
            "Ubicación actualizada correctamente."
          );
          router.refresh();
        } catch (error) {
          setLocationMessage(
            error instanceof Error
              ? error.message
              : "No se pudo guardar tu ubicación."
          );
        } finally {
          setRequestingLocation(false);
        }
      },
      (error) => {
        console.error("Error geolocalización:", error);
        setLocationMessage(
          "No se pudo acceder a tu ubicación en este momento."
        );
        setRequestingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }

  async function handleDeleteLocation(locationId: string) {
    const confirmed = window.confirm(
      "¿Seguro que quieres eliminar esta ubicación?"
    );

    if (!confirmed) {
      return;
    }

    setDeletingLocationId(locationId);

    try {
      const response = await fetch("/api/location", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ locationId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "No se pudo eliminar la ubicación."
        );
      }

      setSelectedLocationId((current) =>
        current === locationId ? null : current
      );
      router.refresh();
    } catch (error) {
      console.error("Error eliminando ubicación:", error);
      window.alert(
        error instanceof Error
          ? error.message
          : "No se pudo eliminar la ubicación."
      );
    } finally {
      setDeletingLocationId(null);
    }
  }

  return (
    <div className="space-y-8">
      {/* MAPA */}
      <div>
        <div className="mb-4">
          <h2 className="text-xl font-semibold">
            Mapa de ubicaciones
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            Haz clic en una ubicación del historial para centrar el mapa.
          </p>
        </div>

        <LocationMap
          locations={locations}
          selectedLocationId={selectedLocationId}
          onSelectLocation={setSelectedLocationId}
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">
            Historial de ubicaciones
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            Selecciona una ubicación para verla en el mapa.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void handleRequestCurrentLocation()}
          disabled={requestingLocation}
          className="rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {requestingLocation
            ? "Solicitando ubicación..."
            : "Obtener mi ubicación"}
        </button>
      </div>

      {locationMessage && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-gray-300">
          {locationMessage}
        </div>
      )}

      {/* HISTORIAL */}
      <div>

        {locations.length === 0 ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 text-center text-gray-500">
            Todavía no hay ubicaciones.
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-zinc-800">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-zinc-900">
                  <tr>
                    <th className="px-4 py-3 text-left text-gray-400">
                      Fecha
                    </th>

                    <th className="px-4 py-3 text-left text-gray-400">
                      Latitud
                    </th>

                    <th className="px-4 py-3 text-left text-gray-400">
                      Longitud
                    </th>

                    <th className="px-4 py-3 text-left text-gray-400">
                      Precisión
                    </th>

                    <th className="px-4 py-3 text-left text-gray-400">
                      Acción
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {locations.map((location) => (
                    <tr
                      key={location.id}
                      onClick={() =>
                        setSelectedLocationId(location.id)
                      }
                      className={`cursor-pointer border-t border-zinc-800 transition ${
                        selectedLocationId === location.id
                          ? "bg-red-950/40"
                          : "hover:bg-zinc-900"
                      }`}
                    >
                      <td className="px-4 py-4 text-gray-300">
                        {new Date(
                          location.createdAt
                        ).toLocaleString("es-PE")}
                      </td>

                      <td className="px-4 py-4 text-gray-300">
                        {location.latitude.toFixed(6)}
                      </td>

                      <td className="px-4 py-4 text-gray-300">
                        {location.longitude.toFixed(6)}
                      </td>

                      <td className="px-4 py-4 text-gray-400">
                        {location.accuracy !== null
                          ? `±${Math.round(location.accuracy)} m`
                          : "—"}
                      </td>

                      <td className="px-4 py-4">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            void handleDeleteLocation(location.id);
                          }}
                          disabled={
                            deletingLocationId === location.id
                          }
                          className="rounded-lg border border-red-700/70 bg-red-950/50 px-3 py-2 text-xs font-medium text-red-200 transition hover:bg-red-900 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {deletingLocationId === location.id
                            ? "Eliminando..."
                            : "Eliminar"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="border-t border-zinc-800 px-4 py-3 text-xs text-gray-500">
              Haz clic en una fila para centrar el mapa en esa ubicación.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
