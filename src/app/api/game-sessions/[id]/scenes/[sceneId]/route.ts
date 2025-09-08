import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { gameSessionQueries, gameSceneQueries } from '@/db/queries';
import { db } from '@/db';
import { gameScenes } from '@/db/schema';
import { eq, and, gt, asc } from 'drizzle-orm';

interface RouteParams {
  params: Promise<{
    id: string;
    sceneId: string;
  }>;
}

// DELETE - Eliminar escena específica
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
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

    const { id: sessionId, sceneId } = await params;

    // Verificar que la sesión existe y pertenece al usuario
    const gameSession = await gameSessionQueries.getById(sessionId);
    if (!gameSession) {
      return NextResponse.json(
        { error: 'Sesión no encontrada' },
        { status: 404 }
      );
    }

    if (gameSession.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'No autorizado para modificar esta sesión' },
        { status: 403 }
      );
    }

    // Verificar que la escena existe
    const scene = await gameSceneQueries.getById(sceneId);
    if (!scene) {
      return NextResponse.json(
        { error: 'Escena no encontrada' },
        { status: 404 }
      );
    }

    // Verificar que la escena pertenece a la sesión
    if (scene.sessionId !== sessionId) {
      return NextResponse.json(
        { error: 'La escena no pertenece a esta sesión' },
        { status: 400 }
      );
    }

    // No permitir eliminar la primera escena (order = 0)
    if (scene.order === 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar la primera escena de la historia' },
        { status: 400 }
      );
    }

    // Obtener todas las escenas posteriores para reordenar
    const scenesToReorder = await db
      .select()
      .from(gameScenes)
      .where(
        and(
          eq(gameScenes.sessionId, sessionId),
          gt(gameScenes.order, scene.order)
        )
      )
      .orderBy(asc(gameScenes.order));

    // Eliminar la escena
    await gameSceneQueries.delete(sceneId);

    // Reordenar las escenas posteriores
    for (const sceneToReorder of scenesToReorder) {
      await gameSceneQueries.update(sceneToReorder.id, {
        order: sceneToReorder.order - 1
      });
    }

    // Obtener las escenas actualizadas
    const updatedScenes = await gameSceneQueries.getBySessionId(sessionId);

    return NextResponse.json({
      success: true,
      message: 'Escena eliminada correctamente',
      scenes: updatedScenes
    });

  } catch (error) {
    console.error('Error al eliminar escena:', error);
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}

// PUT - Regenerar escena específica
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
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

    const { id: sessionId, sceneId } = await params;
    const body = await request.json();
    const { userMessage } = body;

    // Verificar que la sesión existe y pertenece al usuario
    const gameSession = await gameSessionQueries.getById(sessionId);
    if (!gameSession) {
      return NextResponse.json(
        { error: 'Sesión no encontrada' },
        { status: 404 }
      );
    }

    if (gameSession.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'No autorizado para modificar esta sesión' },
        { status: 403 }
      );
    }

    // Verificar que la escena existe
    const scene = await gameSceneQueries.getById(sceneId);
    if (!scene) {
      return NextResponse.json(
        { error: 'Escena no encontrada' },
        { status: 404 }
      );
    }

    // Verificar que la escena pertenece a la sesión
    if (scene.sessionId !== sessionId) {
      return NextResponse.json(
        { error: 'La escena no pertenece a esta sesión' },
        { status: 400 }
      );
    }

    // Obtener todas las escenas anteriores para construir el historial
    const allScenes = await gameSceneQueries.getBySessionId(sessionId);
    const previousScenes = allScenes
      .filter(s => s.order < scene.order)
      .sort((a, b) => a.order - b.order);
    
    // Construir el historial de conversación
    const conversationHistory = [];
    for (const prevScene of previousScenes) {
      if (prevScene.narrativeText) {
        conversationHistory.push({
          role: 'assistant' as const,
          content: prevScene.narrativeText
        });
      }
    }

    // Generar nueva historia usando la misma lógica que generate-story
    const baseUrl = process.env.NEXTAUTH_URL || `http://localhost:${process.env.PORT || 3000}`;
    const storyResponse = await fetch(`${baseUrl}/api/generate-story`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userMessage: userMessage || '',
        conversationHistory: conversationHistory,
        isStart: scene.order === 0,
        regenerate: true
      })
    });

    if (!storyResponse.ok) {
      throw new Error('Error al regenerar la historia');
    }

    const storyData = await storyResponse.json();

    // Generar nueva imagen
    const imageResponse = await fetch(`${baseUrl}/api/generate-image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: storyData.imagePrompt,
        characterVisualPrompt: storyData.characterVisualPrompt,
        includeCharacter: storyData.includeCharacter
      })
    });

    let imageUrl = scene.imageUrl; // Mantener la imagen anterior si falla
    if (imageResponse.ok) {
      const imageData = await imageResponse.json();
      if (imageData.success && imageData.imageUrl) {
        imageUrl = imageData.imageUrl;
      }
    }

    // Actualizar la escena con el nuevo contenido
    const updatedScene = await gameSceneQueries.update(sceneId, {
      narrativeText: storyData.narrative,
      imageUrl: imageUrl
    });

    return NextResponse.json({
      success: true,
      message: 'Escena regenerada correctamente',
      scene: updatedScene,
      storyData: {
        narrative: storyData.narrative,
        imagePrompt: storyData.imagePrompt,
        characterVisualPrompt: storyData.characterVisualPrompt,
        includeCharacter: storyData.includeCharacter
      }
    });

  } catch (error) {
    console.error('Error al regenerar escena:', error);
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}