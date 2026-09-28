"use client";

import { useEffect, useState } from "react";

type Share = {
  id: string;
  shareUrl: string;
  createdAt: string;
  expiresAt: string | null;
};

type SharedLocation = {
  id: string;
  latitude: number;
  longitude: number;
  accuracy: number | null;
  createdAt: string;
};

export default function ShareLocationButton() {
  const [share, setShare] = useState<Share | null>(null);
  const [sharedLocation, setSharedLocation] =
    useState<SharedLocation | null>(null);

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [revoking, setRevoking] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadSharedLocation(
    shareValue: Share | null
  ) {
    if (!shareValue?.shareUrl) {
      setSharedLocation(null);
      return;
    }

    try {
      setLocationLoading(true);

      const url = new URL(shareValue.shareUrl);
      const token = url.pathname.split("/").pop();

      if (!token) {
        setSharedLocation(null);
        return;
      }

      const response = await fetch(
        `/api/location?shareToken=${encodeURIComponent(token)}`,
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "No se pudo consultar la ubicación."
        );
      }

      setSharedLocation(data.location ?? null);
    } catch (error) {
      setSharedLocation(null);
      setError(
        error instanceof Error
          ? error.message
          : "No se pudo consultar la ubicación."
      );
    } finally {
      setLocationLoading(false);
    }
  }

  async function loadShare() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "/api/location-share/manage",
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "No se pudo obtener el enlace."
        );
      }

      const nextShare = data.share as Share | null;
      setShare(nextShare);

      if (!nextShare) {
        setSharedLocation(null);
        return;
      }

      await loadSharedLocation(nextShare);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Ocurrió un error."
      );
    } finally {
      setLoading(false);
    }
  }

  async function createShareLink() {
    try {
      setCreating(true);
      setMessage("");
      setError("");

      const response = await fetch(
        "/api/location-share",
        {
          method: "POST",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "No se pudo crear el enlace."
        );
      }

      await loadShare();

      setMessage(
        "Nuevo enlace creado correctamente."
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "No se pudo crear el enlace."
      );
    } finally {
      setCreating(false);
    }
  }

  async function copyShareLink() {
    if (!share?.shareUrl) return;

    try {
      await navigator.clipboard.writeText(
        share.shareUrl
      );

      setMessage("Enlace copiado.");
      setError("");
    } catch {
      setError(
        "No se pudo copiar el enlace."
      );
    }
  }

  async function revokeShareLink() {
    if (!share) return;

    const confirmed = window.confirm(
      "¿Seguro que quieres revocar este enlace? La persona que lo tenga ya no podrá compartir su ubicación."
    );

    if (!confirmed) return;

    try {
      setRevoking(true);
      setMessage("");
      setError("");

      const response = await fetch(
        "/api/location-share/manage",
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            shareId: share.id,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "No se pudo revocar el enlace."
        );
      }

      setShare(null);

      setMessage(
        "El enlace fue revocado correctamente."
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "No se pudo revocar el enlace."
      );
    } finally {
      setRevoking(false);
    }
  }

  useEffect(() => {
    let isMounted = true;

    async function fetchShare() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "/api/location-share/manage",
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || "No se pudo obtener el enlace."
          );
        }

        const nextShare = data.share as Share | null;

        if (isMounted) {
          setShare(nextShare);
        }

        if (!nextShare) {
          if (isMounted) {
            setSharedLocation(null);
          }
          return;
        }

        try {
          if (isMounted) {
            setLocationLoading(true);
          }

          const url = new URL(nextShare.shareUrl);
          const token = url.pathname.split("/").pop();

          if (!token) {
            if (isMounted) {
              setSharedLocation(null);
            }
            return;
          }

          const locationResponse = await fetch(
            `/api/location?shareToken=${encodeURIComponent(token)}`,
            {
              method: "GET",
              cache: "no-store",
            }
          );

          const locationData = await locationResponse.json();

          if (!locationResponse.ok) {
            throw new Error(
              locationData.error ||
                "No se pudo consultar la ubicación."
            );
          }

          if (isMounted) {
            setSharedLocation(locationData.location ?? null);
          }
        } catch (error) {
          if (isMounted) {
            setSharedLocation(null);
            setError(
              error instanceof Error
                ? error.message
                : "No se pudo consultar la ubicación."
            );
          }
        } finally {
          if (isMounted) {
            setLocationLoading(false);
          }
        }
      } catch (error) {
        if (isMounted) {
          setError(
            error instanceof Error
              ? error.message
              : "Ocurrió un error."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    void fetchShare();

    return () => {
      isMounted = false;
    };
  }, []);

  function formatDate(date: string | null) {
    if (!date) {
      return "Sin expiración";
    }

    return new Date(date).toLocaleString(
      "es-PE",
      {
        dateStyle: "medium",
        timeStyle: "short",
      }
    );
  }

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">
            Compartir ubicación
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-400">
            Administra el enlace que permite compartir
            voluntariamente una ubicación contigo.
          </p>
        </div>

        <button
          type="button"
          onClick={createShareLink}
          disabled={creating}
          className="rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {creating
            ? "Generando..."
            : share
              ? "Generar nuevo"
              : "Generar enlace"}
        </button>
      </div>

      {loading ? (
        <div className="mt-6 rounded-xl border border-zinc-800 bg-black p-5 text-sm text-gray-500">
          Cargando enlace...
        </div>
      ) : share ? (
        <div className="mt-6 rounded-2xl border border-zinc-800 bg-black p-5">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-green-500" />

            <span className="text-sm font-medium text-green-400">
              Enlace activo
            </span>
          </div>

          <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-950 p-4">
            <p className="break-all text-sm text-gray-300">
              {share.shareUrl}
            </p>
          </div>

          <div className="mt-4 flex flex-col gap-3 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between">
            <div>
              Creado:{" "}
              {formatDate(share.createdAt)}
            </div>

            <div>
              Expira: Sin expiración
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={copyShareLink}
              className="rounded-xl border border-zinc-700 px-4 py-3 text-sm font-medium text-gray-200 transition hover:border-red-500 hover:bg-red-950/30"
            >
              📋 Copiar enlace
            </button>

            <button
              type="button"
              onClick={revokeShareLink}
              disabled={revoking}
              className="rounded-xl border border-red-900 px-4 py-3 text-sm font-medium text-red-400 transition hover:bg-red-950/40 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {revoking
                ? "Revocando..."
                : "🚫 Revocar enlace"}
            </button>
          </div>

          <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
            <div className="mb-3 flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
              <span className="text-sm font-medium text-blue-300">
                Última ubicación compartida
              </span>
            </div>

            {locationLoading ? (
              <p className="text-sm text-gray-400">
                Consultando ubicación...
              </p>
            ) : sharedLocation ? (
              <div className="space-y-2 text-sm text-gray-300">
                <p>
                  📍 Latitud: {sharedLocation.latitude.toFixed(6)}
                </p>
                <p>
                  📍 Longitud: {sharedLocation.longitude.toFixed(6)}
                </p>
                <p>
                  🕐 {new Date(sharedLocation.createdAt).toLocaleString("es-PE")}
                </p>
                {sharedLocation.accuracy !== null && (
                  <p>
                    🎯 Precisión: ±{Math.round(sharedLocation.accuracy)} m
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-400">
                Todavía no hay ubicaciones compartidas desde este enlace.
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="mt-6 rounded-xl border border-dashed border-zinc-800 bg-black p-6 text-center">
          <div className="text-4xl">
            🔗
          </div>

          <p className="mt-3 text-sm text-gray-400">
            No tienes ningún enlace activo.
          </p>

          <button
            type="button"
            onClick={createShareLink}
            disabled={creating}
            className="mt-4 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold transition hover:bg-red-500 disabled:opacity-50"
          >
            {creating
              ? "Generando..."
              : "Crear enlace"}
          </button>
        </div>
      )}

      {message && (
        <div className="mt-4 rounded-xl border border-green-900 bg-green-950/30 px-4 py-3 text-sm text-green-400">
          {message}
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-xl border border-red-900 bg-red-950/30 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}
    </section>
  );
}