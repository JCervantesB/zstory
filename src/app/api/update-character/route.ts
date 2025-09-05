import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function PUT(request: NextRequest) {
  try {
    // Get the session from Better Auth
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const {
      characterName,
      characterLastName,
      characterDescription,
      characterOriginLocation,
      characterCurrentLocation,
      characterSpecialty,
      characterVisualPrompt,
      characterImageUrl,
      characterClothingSet,
      characterSelectedItems
    } = await request.json();

    // Validate required fields
    if (!characterName || !characterSpecialty) {
      return NextResponse.json(
        { error: 'Nombre y especialidad son requeridos' },
        { status: 400 }
      );
    }

    // Validar que la especialidad sea válida
    const validSpecialties = ['survivor', 'medic', 'engineer', 'scout', 'leader', 'scavenger'];
    if (!validSpecialties.includes(characterSpecialty)) {
      return NextResponse.json(
        { error: 'Especialidad no válida' },
        { status: 400 }
      );
    }

    // Preparar datos para actualizar
    const updateData: Partial<typeof users.$inferInsert> = {
      characterName: characterName.trim(),
      characterLastName: characterLastName?.trim() || null,
      characterDescription: characterDescription?.trim() || null,
      characterOriginLocation: characterOriginLocation?.trim() || null,
      characterCurrentLocation: characterCurrentLocation?.trim() || null,
      characterSpecialty,
      characterClothingSet: characterClothingSet || null,
      characterSelectedItems: characterSelectedItems || null,
      updatedAt: new Date().toISOString(),
    };

    // Actualizar characterVisualPrompt si se proporciona
    if (characterVisualPrompt?.trim()) {
      updateData.characterVisualPrompt = characterVisualPrompt.trim();
    }

    // Solo actualizar la imagen si se proporciona una nueva
    if (characterImageUrl) {
      updateData.characterImageUrl = characterImageUrl;
    }

    // Update user's character data in database
    const [updatedUser] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, session.user.id))
      .returning();

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Actualizar la sesión con los nuevos datos del usuario
    try {
      // Filter only the fields that are valid for session update
      const sessionUpdateData = {
        characterName: updateData.characterName,
        characterLastName: updateData.characterLastName,
        characterDescription: updateData.characterDescription,
        characterOriginLocation: updateData.characterOriginLocation,
        characterCurrentLocation: updateData.characterCurrentLocation,
        characterSpecialty: updateData.characterSpecialty,
        characterImageUrl: updateData.characterImageUrl,
        characterVisualPrompt: updateData.characterVisualPrompt,
        characterClothingSet: updateData.characterClothingSet,
        characterSelectedItems: updateData.characterSelectedItems,
      };
      
      await auth.api.updateUser({
        headers: await headers(),
        body: sessionUpdateData,
      });
    } catch (sessionError) {
      console.warn('Warning: Could not update session:', sessionError);
      // Continue even if session update fails
    }

    // Retornar el usuario actualizado
    return NextResponse.json({
      message: 'Personaje actualizado exitosamente',
      user: updatedUser,
    });

  } catch (error) {
    console.error('Error updating character:', error);
    
    return NextResponse.json(
      { 
        error: 'Error interno del servidor al actualizar el personaje',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}

// Mantener POST para compatibilidad con código existente
export async function POST(request: NextRequest) {
  return PUT(request);
}