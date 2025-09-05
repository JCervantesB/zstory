import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { gameSessionQueries, gameSceneQueries } from '@/db/queries';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// GET - Obtener sesión específica con sus escenas
export async function GET(
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

    const { id } = await params;

    // Obtener la sesión
    const gameSession = await gameSessionQueries.getById(id);
    if (!gameSession) {
      return NextResponse.json(
        { error: 'Sesión no encontrada' },
        { status: 404 }
      );
    }

    // Verificar que la sesión pertenece al usuario
    if (gameSession.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'No autorizado para acceder a esta sesión' },
        { status: 403 }
      );
    }

    // Obtener las escenas de la sesión
    const scenes = await gameSceneQueries.getBySessionId(id);

    // Actualizar lastActive
    await gameSessionQueries.updateLastActive(id);

    return NextResponse.json({
      success: true,
      session: gameSession,
      scenes: scenes
    });

  } catch (error) {
    console.error('Error al obtener sesión:', error);
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}

// PUT - Actualizar sesión
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

    const { id } = await params;
    const body = await request.json();
    const { title, isCompleted } = body;

    // Verificar que la sesión existe y pertenece al usuario
    const gameSession = await gameSessionQueries.getById(id);
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

    // Actualizar la sesión
    let updatedSession;
    if (title !== undefined) {
      updatedSession = await gameSessionQueries.updateTitle(id, title);
    }
    if (isCompleted !== undefined) {
      if (isCompleted) {
        updatedSession = await gameSessionQueries.markCompleted(id);
      }
    }

    // Si no se especificó ninguna actualización, solo actualizar lastActive
    if (title === undefined && isCompleted === undefined) {
      updatedSession = await gameSessionQueries.updateLastActive(id);
    }

    return NextResponse.json({
      success: true,
      session: updatedSession
    });

  } catch (error) {
    console.error('Error al actualizar sesión:', error);
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}

// PATCH - Actualizar campos específicos de la sesión
export async function PATCH(
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

    const { id } = await params;
    const body = await request.json();
    const { title } = body;

    // Verificar que la sesión existe y pertenece al usuario
    const gameSession = await gameSessionQueries.getById(id);
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

    // Actualizar solo el título
    if (title !== undefined) {
      if (typeof title !== 'string' || title.trim().length === 0) {
        return NextResponse.json(
          { error: 'El título debe ser una cadena no vacía' },
          { status: 400 }
        );
      }

      const updatedSession = await gameSessionQueries.updateTitle(id, title.trim());
      
      return NextResponse.json({
        success: true,
        session: updatedSession
      });
    }

    return NextResponse.json(
      { error: 'No se especificaron campos para actualizar' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error al actualizar sesión:', error);
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar sesión
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

    const { id } = await params;

    // Verificar que la sesión existe y pertenece al usuario
    const gameSession = await gameSessionQueries.getById(id);
    if (!gameSession) {
      return NextResponse.json(
        { error: 'Sesión no encontrada' },
        { status: 404 }
      );
    }

    if (gameSession.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'No autorizado para eliminar esta sesión' },
        { status: 403 }
      );
    }

    // Eliminar la sesión (esto también eliminará las escenas por CASCADE)
    await gameSessionQueries.delete(id);

    return NextResponse.json({
      success: true,
      message: 'Sesión eliminada correctamente'
    });

  } catch (error) {
    console.error('Error al eliminar sesión:', error);
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}