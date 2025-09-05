import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

// GET - Obtener perfil del usuario con currentSessionId
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

    // Obtener datos del usuario
    const [userData] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        currentSessionId: users.currentSessionId,
        characterName: users.characterName,
        characterLastName: users.characterLastName,
        characterDescription: users.characterDescription,
        characterSpecialty: users.characterSpecialty,
        characterImageUrl: users.characterImageUrl,
        isOnboarded: users.isOnboarded
      })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!userData) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: userData
    });

  } catch (error) {
    console.error('Error al obtener perfil de usuario:', error);
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}