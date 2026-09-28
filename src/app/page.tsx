import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";

export default async function Home() {
  const share = await prisma.locationShare.findFirst({
    where: {
      active: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      token: true,
    },
  });

  if (!share) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
        <div className="w-full max-w-xl text-center">
          <div className="mb-8 text-7xl">
            ❤️
          </div>

          <h1 className="mb-6 text-4xl font-bold md:text-6xl">
            Tengo una pequeña sorpresa para ti...
          </h1>

          <p className="mb-6 text-lg text-gray-400">
            El enlace de ubicación todavía no está disponible.
          </p>

          <p className="text-sm text-gray-500">
            Genera un enlace desde el dashboard.
          </p>
        </div>
      </main>
    );
  }

  redirect(`/sorpresa/${share.token}`);
}