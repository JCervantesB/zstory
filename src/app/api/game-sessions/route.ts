import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { gameSessionQueries } from '@/db/queries';
import { generateId } from '@/lib/utils';

// GET - Obtener todas las sesiones del usuario
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const session = await auth.api.getSession({
      headers: request.headers
    });
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Obtener sesiones del usuario
    const userSessions = await gameSessionQueries.getByUserId(session.user.id);

    return NextResponse.json({
      success: true,
      sessions: userSessions
    });

  } catch (error) {
    console.error('Error al obtener sesiones:', error);
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}

// POST - Crear nueva sesión
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const session = await auth.api.getSession({
      headers: request.headers
    });
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title } = body;

    // Crear nueva sesión (pública por defecto)
    const now = new Date().toISOString();
    const newGameSession = await gameSessionQueries.create({
      id: generateId(),
      userId: session.user.id,
      title: title || `Historia Zombie - ${new Date().toLocaleDateString()}`,
      isCompleted: false,
      isPublic: true, // Las historias son públicas por defecto
      createdAt: now,
      lastActive: now
    });

    return NextResponse.json({
      success: true,
      session: newGameSession
    });

  } catch (error) {
    console.error('Error al crear sesión:', error);
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}