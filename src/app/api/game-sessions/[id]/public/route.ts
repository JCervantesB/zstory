import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { gameSessions } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const { isPublic } = await request.json();

    if (typeof isPublic !== 'boolean') {
      return NextResponse.json(
        { error: 'El campo isPublic debe ser un booleano' },
        { status: 400 }
      );
    }

    // Verify the session belongs to the user and is completed
    const sessionResult = await db
      .select({
        id: gameSessions.id,
        userId: gameSessions.userId,
        isCompleted: gameSessions.isCompleted,
        isPublic: gameSessions.isPublic,
      })
      .from(gameSessions)
      .where(eq(gameSessions.id, id))
      .limit(1);

    if (sessionResult.length === 0) {
      return NextResponse.json(
        { error: 'Sesión no encontrada' },
        { status: 404 }
      );
    }

    const gameSession = sessionResult[0];

    if (gameSession.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'No tienes permisos para modificar esta historia' },
        { status: 403 }
      );
    }

    // Permitir cambiar visibilidad de cualquier historia (no solo completadas)

    // Update the public status
    await db
      .update(gameSessions)
      .set({ isPublic })
      .where(eq(gameSessions.id, id));

    return NextResponse.json({
      success: true,
      message: isPublic 
        ? 'Historia compartida públicamente' 
        : 'Historia marcada como privada',
      isPublic,
    });
  } catch (error) {
    console.error('Error updating story public status:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}