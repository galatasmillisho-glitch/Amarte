"use client";

import { useParams } from "next/navigation";
import { useState } from "react";

export default function UbicacionPage() {
  const params = useParams();

  const token = params.token as string;

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [shared, setShared] = useState(false);

  async function requestLocation() {
    if (!navigator.geolocation) {
      setMessage(
        "Tu navegador no permite compartir ubicación."
      );
      return;
    }

    setLoading(true);
    setMessage("Solicitando permiso de ubicación...");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const {
          latitude,
          longitude,
          accuracy,
        } = position.coords;

        try {
          const response = await fetch("/api/location", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              latitude,
              longitude,
              accuracy,
              shareToken: token,
            }),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(
              data.error ||
                "No se pudo enviar la ubicación."
            );
          }

          setShared(true);
          setMessage(
            "Tu ubicación fue compartida correctamente ❤️"
          );
        } catch (error) {
          setMessage(
            error instanceof Error
              ? error.message
              : "Hubo un problema enviando la ubicación."
          );
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);

        setMessage(
          "No compartiste tu ubicación. No pasa nada ❤️"
        );

        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="w-full max-w-xl text-center">
        {!shared ? (
          <>
            <div className="text-6xl mb-6">
              📍
            </div>

            <h1 className="text-3xl md:text-4xl font-bold mb-5">
              Compartir ubicación
            </h1>

            <p className="text-gray-300 leading-relaxed mb-8">
              Si quieres, puedes compartir tu ubicación.
              Tu navegador te preguntará primero si deseas
              permitir el acceso a tu ubicación.
            </p>

            <button
              onClick={requestLocation}
              disabled={loading}
              className="px-8 py-4 rounded-full bg-red-600 hover:bg-red-500 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? "Obteniendo ubicación..."
                : "Compartir mi ubicación 📍"}
            </button>

            {message && (
              <p className="mt-6 text-gray-400">
                {message}
              </p>
            )}

            <p className="text-xs text-gray-500 mt-8">
              Tú decides si quieres compartirla.
            </p>
          </>
        ) : (
          <>
            <div className="text-7xl mb-6">
              ❤️
            </div>

            <h1 className="text-3xl md:text-4xl font-bold">
              Ubicación compartida
            </h1>

            <p className="text-gray-400 mt-4">
              Gracias por compartir tu ubicación.
            </p>
          </>
        )}
      </div>
    </main>
  );
}