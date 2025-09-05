import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { uploadSceneToCloudinary } from '@/lib/cloudinary';
import { gameSceneQueries } from '@/db/queries';
import { generateId } from '@/lib/utils';

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
    const { 
      base64Image, 
      sessionId, 
      order, 
      narrativeText,
      mediaType = 'image/png'
    } = body;

    // Validar datos requeridos
    if (!base64Image || !sessionId || order === undefined || !narrativeText) {
      return NextResponse.json(
        { error: 'Faltan datos requeridos' },
        { status: 400 }
      );
    }

    // Subir imagen a Cloudinary
    const cloudinaryResult = await uploadSceneToCloudinary(
      base64Image,
      mediaType,
      sessionId,
      order
    );

    // Guardar escena en la base de datos
    const newScene = await gameSceneQueries.create({
      id: generateId(),
      sessionId: sessionId,
      order: order,
      narrativeText: narrativeText,
      imageUrl: cloudinaryResult.secure_url,
      createdAt: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      scene: newScene,
      imageUrl: cloudinaryResult.secure_url,
      cloudinaryData: {
        public_id: cloudinaryResult.public_id,
        width: cloudinaryResult.width,
        height: cloudinaryResult.height,
        format: cloudinaryResult.format,
        bytes: cloudinaryResult.bytes
      }
    });

  } catch (error) {
    console.error('Error en upload-scene:', error);
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}

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

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId es requerido' },
        { status: 400 }
      );
    }

    // Obtener escenas de la sesión
    const scenes = await gameSceneQueries.getBySessionId(sessionId);

    return NextResponse.json({
      success: true,
      scenes: scenes
    });

  } catch (error) {
    console.error('Error al obtener escenas:', error);
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}