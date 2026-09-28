import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

async function getAuthenticatedUser() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

export async function GET() {
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }

    const share = await prisma.locationShare.findFirst({
      where: {
        userId: user.id,
        active: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        token: true,
        createdAt: true,
        expiresAt: true,
      },
    });

    if (!share) {
      return NextResponse.json({
        share: null,
      });
    }

    const origin =
      process.env.NEXT_PUBLIC_SITE_URL ||
      "http://localhost:3000";

    return NextResponse.json({
      share: {
        id: share.id,
        shareUrl: `${origin}/sorpresa/${share.token}`,
        createdAt: share.createdAt,
        expiresAt: share.expiresAt,
      },
    });
  } catch (error) {
    console.error(
      "Error obteniendo enlace:",
      error
    );

    return NextResponse.json(
      {
        error: "No se pudo obtener el enlace",
      },
      {
        status: 500,
      }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const shareId = body.shareId;

    if (
      typeof shareId !== "string" ||
      !shareId.trim()
    ) {
      return NextResponse.json(
        {
          error: "Enlace inválido",
        },
        {
          status: 400,
        }
      );
    }

    const share = await prisma.locationShare.findFirst({
      where: {
        id: shareId,
        userId: user.id,
        active: true,
      },
      select: {
        id: true,
      },
    });

    if (!share) {
      return NextResponse.json(
        {
          error: "Enlace no encontrado",
        },
        {
          status: 404,
        }
      );
    }

    await prisma.locationShare.update({
      where: {
        id: share.id,
      },
      data: {
        active: false,
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "Error revocando enlace:",
      error
    );

    return NextResponse.json(
      {
        error: "No se pudo revocar el enlace",
      },
      {
        status: 500,
      }
    );
  }
}