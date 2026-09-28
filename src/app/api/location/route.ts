import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      latitude,
      longitude,
      accuracy,
      shareToken,
    } = body;

    const isSelfLocationRequest =
      typeof shareToken === "undefined" ||
      shareToken === null ||
      shareToken === "";

    if (
      !isSelfLocationRequest &&
      (typeof shareToken !== "string" ||
        shareToken.length < 20)
    ) {
      return NextResponse.json(
        {
          error: "Enlace de ubicación inválido",
        },
        {
          status: 401,
        }
      );
    }

    // Validar coordenadas
    if (
      typeof latitude !== "number" ||
      typeof longitude !== "number" ||
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude)
    ) {
      return NextResponse.json(
        {
          error: "Ubicación inválida",
        },
        {
          status: 400,
        }
      );
    }

    // Validar rango
    if (
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      return NextResponse.json(
        {
          error: "Coordenadas fuera de rango",
        },
        {
          status: 400,
        }
      );
    }

    if (
      typeof accuracy !== "undefined" &&
      accuracy !== null &&
      (!Number.isFinite(accuracy) || accuracy < 0)
    ) {
      return NextResponse.json(
        {
          error: "Precisión de ubicación inválida",
        },
        {
          status: 400,
        }
      );
    }

    let ownerUserId: string;

    if (isSelfLocationRequest) {
      const supabase = await createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return NextResponse.json(
          {
            error: "No autenticado",
          },
          {
            status: 401,
          }
        );
      }

      ownerUserId = user.id;
    } else {
      // Buscar enlace de ubicación
      const share = await prisma.locationShare.findUnique({
        where: {
          token: shareToken,
        },
        select: {
          userId: true,
          active: true,
          expiresAt: true,
        },
      });

      // Token inexistente
      if (!share) {
        return NextResponse.json(
          {
            error: "Enlace de ubicación inválido",
          },
          {
            status: 401,
          }
        );
      }

      // Token revocado
      if (!share.active) {
        return NextResponse.json(
          {
            error: "Este enlace ya no está activo",
          },
          {
            status: 401,
          }
        );
      }

      ownerUserId = share.userId;
    }

    // Guardar ubicación
    const location = await prisma.location.create({
      data: {
        userId: ownerUserId,
        latitude,
        longitude,
        accuracy:
          typeof accuracy === "number"
            ? accuracy
            : null,
      },
    });

    return NextResponse.json({
      success: true,
      id: location.id,
    });
  } catch (error) {
    console.error(
      "Error guardando ubicación:",
      error
    );

    return NextResponse.json(
      {
        error: "No se pudo guardar la ubicación",
      },
      {
        status: 500,
      }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const shareToken = searchParams.get("shareToken");

    if (!shareToken || shareToken.trim().length < 20) {
      return NextResponse.json(
        {
          error: "Token de enlace inválido",
        },
        {
          status: 400,
        }
      );
    }

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        {
          error: "No autenticado",
        },
        {
          status: 401,
        }
      );
    }

    const share = await prisma.locationShare.findUnique({
      where: {
        token: shareToken,
      },
      select: {
        userId: true,
        active: true,
        expiresAt: true,
      },
    });

    if (!share) {
      return NextResponse.json(
        {
          error: "Enlace de ubicación inválido",
        },
        {
          status: 401,
        }
      );
    }

    if (!share.active) {
      return NextResponse.json(
        {
          error: "Este enlace ya no está activo",
        },
        {
          status: 401,
        }
      );
    }

    const latestLocation = await prisma.location.findFirst({
      where: {
        userId: share.userId,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        latitude: true,
        longitude: true,
        accuracy: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      location: latestLocation,
    });
  } catch (error) {
    console.error("Error consultando ubicación compartida:", error);

    return NextResponse.json(
      {
        error: "No se pudo consultar la ubicación",
      },
      {
        status: 500,
      }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const locationId = body.locationId;

    if (
      typeof locationId !== "string" ||
      !locationId.trim()
    ) {
      return NextResponse.json(
        {
          error: "Identificador de ubicación inválido",
        },
        {
          status: 400,
        }
      );
    }

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        {
          error: "No autenticado",
        },
        {
          status: 401,
        }
      );
    }

    const deletedLocation = await prisma.location.deleteMany({
      where: {
        id: locationId,
        userId: user.id,
      },
    });

    if (deletedLocation.count === 0) {
      return NextResponse.json(
        {
          error: "No se encontró la ubicación para eliminar",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      success: true,
      deletedId: locationId,
    });
  } catch (error) {
    console.error("Error eliminando ubicación:", error);

    return NextResponse.json(
      {
        error: "No se pudo eliminar la ubicación",
      },
      {
        status: 500,
      }
    );
  }
}