import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";

import { createClient } from "@/lib/supabase/server";

import LogoutButton from "./LogoutButton";

import LocationDashboardClient from "./LocationDashboardClient";
import ShareLocationButton from "./ShareLocationButton";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

    const locations = await prisma.location.findMany({
    where: {
        userId: user.id,
    },
    orderBy: {
        createdAt: "desc",
    },
    });

  return (
    <main className="min-h-screen bg-black text-white p-6 md:p-10">

      <div className="max-w-7xl mx-auto">

        {/* Encabezado */}
        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div>
            <p className="text-red-500 font-semibold tracking-widest uppercase text-sm">
            Detalle Especial
            </p>

            <h1 className="text-3xl md:text-4xl font-bold mt-2">
            Historial de ubicaciones
            </h1>

            <p className="text-gray-400 mt-2">
            Ubicaciones compartidas voluntariamente desde la página.
            </p>
        </div>

        <LogoutButton />
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <p className="text-gray-400 text-sm">
              Total de ubicaciones
            </p>

            <p className="text-3xl font-bold mt-2">
              {locations.length}
            </p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <p className="text-gray-400 text-sm">
              Última ubicación
            </p>

            <p className="text-lg font-semibold mt-2">
              {locations.length > 0
                ? new Date(
                    locations[0].createdAt
                  ).toLocaleString("es-PE")
                : "Sin registros"}
            </p>
          </div>

        </div>

        <div className="mb-8">
        <div className="mb-4">
            <h2 className="text-xl font-semibold">
            Mapa de ubicaciones
            </h2>

            <p className="text-sm text-gray-500 mt-1">
            Visualización de las ubicaciones compartidas.
            </p>
        </div>
        <div className="space-y-8">
          <ShareLocationButton />

          <LocationDashboardClient
            locations={locations.map((location) => ({
              ...location,
              createdAt: location.createdAt.toISOString(),
            }))}
          />
        </div>
        </div>

        {/* Historial */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">

          <div className="p-6 border-b border-zinc-800">
            <h2 className="text-xl font-semibold">
              Historial
            </h2>
          </div>

          {locations.length === 0 ? (
            <div className="p-10 text-center">
              <div className="text-5xl mb-4">
                📍
              </div>

              <p className="text-gray-400">
                Todavía no hay ubicaciones guardadas.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full text-left">

                <thead className="bg-zinc-950">
                  <tr>
                    <th className="px-6 py-4 text-sm text-gray-400">
                      #
                    </th>

                    <th className="px-6 py-4 text-sm text-gray-400">
                      Latitud
                    </th>

                    <th className="px-6 py-4 text-sm text-gray-400">
                      Longitud
                    </th>

                    <th className="px-6 py-4 text-sm text-gray-400">
                      Precisión
                    </th>

                    <th className="px-6 py-4 text-sm text-gray-400">
                      Fecha
                    </th>
                  </tr>
                </thead>

                <tbody>

                  {locations.map((location, index) => (
                    <tr
                      key={location.id}
                      className="border-t border-zinc-800 hover:bg-zinc-800/50 transition"
                    >

                      <td className="px-6 py-4 text-gray-500">
                        {index + 1}
                      </td>

                      <td className="px-6 py-4 font-mono">
                        {location.latitude.toFixed(6)}
                      </td>

                      <td className="px-6 py-4 font-mono">
                        {location.longitude.toFixed(6)}
                      </td>

                      <td className="px-6 py-4">
                        {location.accuracy
                          ? `±${Math.round(
                              location.accuracy
                            )} m`
                          : "No disponible"}
                      </td>

                      <td className="px-6 py-4 text-gray-400">
                        {new Date(
                          location.createdAt
                        ).toLocaleString("es-PE")}
                      </td>

                    </tr>
                  ))}

                </tbody>

              </table>

            </div>
          )}

        </div>

      </div>
    </main>
  );
}