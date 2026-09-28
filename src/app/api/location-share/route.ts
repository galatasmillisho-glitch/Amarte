import { NextResponse } from "next/server";
import { randomBytes } from "crypto";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }

    const token = randomBytes(32).toString("hex");

    const share = await prisma.locationShare.create({
      data: {
        userId: user.id,
        token,
        active: true,
        expiresAt: null,
      },
    });

    const origin =
      process.env.NEXT_PUBLIC_SITE_URL ||
      "http://localhost:3000";

    return NextResponse.json({
      success: true,
      shareUrl: `${origin}/sorpresa/${share.token}`,
      expiresAt: share.expiresAt,
    });
  } catch (error) {
    console.error("Error creando enlace:", error);

    return NextResponse.json(
      { error: "No se pudo crear el enlace" },
      { status: 500 }
    );
  }
}