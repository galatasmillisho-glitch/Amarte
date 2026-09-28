"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function SorpresaPage() {
  const router = useRouter();
  const params = useParams();

  const token = params.token as string;

  const [showLocation, setShowLocation] = useState(false);

  function openLocation() {
    router.push(`/ubicacion/${token}`);
  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="w-full max-w-xl text-center">

        {!showLocation ? (
          <>
            <div className="mb-8 text-7xl animate-pulse">
              ❤️
            </div>

            <h1 className="mb-6 text-4xl font-bold md:text-6xl">
              Tengo una pequeña sorpresa para ti...
            </h1>

            <p className="mb-10 text-lg text-gray-400">
              Pero primero tienes que abrirla.
            </p>

            <button
              type="button"
              onClick={() => setShowLocation(true)}
              className="rounded-full bg-red-600 px-8 py-4 text-lg font-semibold shadow-lg shadow-red-600/30 transition-all hover:bg-red-500"
            >
              Abrir mi sorpresa ❤️
            </button>
          </>
        ) : (
          <>
            <div className="mb-6 text-6xl">
              📍
            </div>

            <h2 className="mb-5 text-3xl font-bold">
              Una última cosita...
            </h2>

            <p className="mb-8 leading-relaxed text-gray-300">
              Si quieres, puedes compartir tu ubicación
              conmigo. Al pulsar el botón, tu navegador
              te preguntará si deseas permitirlo.
            </p>

            <button
              type="button"
              onClick={openLocation}
              className="rounded-full bg-red-600 px-8 py-4 font-semibold transition-all hover:bg-red-500"
            >
              Compartir mi ubicación 📍
            </button>

            <p className="mt-8 text-xs text-gray-500">
              Tú decides si quieres compartirla.
            </p>
          </>
        )}

      </div>
    </main>
  );
}