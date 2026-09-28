"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);

    const supabase = createClient();

    await supabase.auth.signOut();

    router.push("/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm font-medium text-gray-300 transition hover:border-red-500 hover:bg-red-950/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
    >
      {loading ? "Cerrando sesión..." : "Cerrar sesión"}
    </button>
  );
}