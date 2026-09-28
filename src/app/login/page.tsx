"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setError("");

    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("Correo o contraseña incorrectos.");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <p className="text-red-500 font-semibold tracking-[0.3em] uppercase text-sm">
            Detalle Especial
          </p>

          <h1 className="text-4xl font-bold mt-3">
            Dashboard
          </h1>

          <p className="text-gray-400 mt-2">
            Inicia sesión para continuar
          </p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 md:p-8">

          <form onSubmit={handleLogin} className="space-y-5">

            <div>
              <label
                htmlFor="email"
                className="block text-sm text-gray-300 mb-2"
              >
                Correo electrónico
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="correo@ejemplo.com"
                required
                className="w-full rounded-xl bg-zinc-950 border border-zinc-700 px-4 py-3 text-white outline-none focus:border-red-500 transition"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm text-gray-300 mb-2"
              >
                Contraseña
              </label>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                required
                className="w-full rounded-xl bg-zinc-950 border border-zinc-700 px-4 py-3 text-white outline-none focus:border-red-500 transition"
              />
            </div>

            {error && (
              <div className="rounded-xl border border-red-900 bg-red-950/40 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed py-3 font-semibold transition"
            >
              {loading ? "Iniciando sesión..." : "Iniciar sesión"}
            </button>

          </form>

        </div>
      </div>
    </main>
  );
}