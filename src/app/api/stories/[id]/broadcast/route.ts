import { NextRequest, NextResponse } from 'next/server';
import { broadcastNewScene } from '@/lib/sse-manager';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Verify authentication
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { id: storyId } = await params;
    const { scene, imageUrl } = await request.json();

    // Broadcast the new scene to connected clients
    broadcastNewScene(storyId, {
      ...scene,
      imageUrl
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error broadcasting scene:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}