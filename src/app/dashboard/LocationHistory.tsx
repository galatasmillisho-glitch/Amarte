
"use client";

type Location = {
  id: string;
  latitude: number;
  longitude: number;
  accuracy: number | null;
  createdAt: string;
};

type LocationHistoryProps = {
  locations: Location[];
  onSelectLocation: (id: string) => void;
};

export default function LocationHistory({
  locations,
  onSelectLocation,
}: LocationHistoryProps) {
  if (locations.length === 0) {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 text-center text-gray-500">
        Todavía no hay historial de ubicaciones.
      </div>
    );
  }

  return (
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
            </tr>
          </thead>

          <tbody>
            {locations.map((location) => (
              <tr
                key={location.id}
                onClick={() => onSelectLocation(location.id)}
                className="cursor-pointer border-t border-zinc-800 transition hover:bg-zinc-900"
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="border-t border-zinc-800 px-4 py-3 text-xs text-gray-500">
        Haz clic en una ubicación para verla en el mapa.
      </div>
    </div>
  );
}

