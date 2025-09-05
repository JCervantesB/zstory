import { NextRequest } from 'next/server';
import { db } from '@/db';
import { gameSessions } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { addConnection, removeConnection } from '@/lib/sse-manager';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: storyId } = await params;

  // Verify story exists and is public
  const story = await db.select()
    .from(gameSessions)
    .where(and(
      eq(gameSessions.id, storyId),
      eq(gameSessions.isPublic, true)
    ))
    .limit(1);

  if (!story.length) {
    return new Response('Story not found or not public', { status: 404 });
  }

  const stream = new ReadableStream({
    start(controller) {
      // Store connection
      addConnection(storyId, controller);

      // Send initial connection message
      controller.enqueue(`data: ${JSON.stringify({ type: 'connected', storyId })}\n\n`);

      // Handle client disconnect
      request.signal.addEventListener('abort', () => {
        removeConnection(storyId, controller);
        try {
           controller.close();
         } catch {
           // Controller might already be closed
           console.log('Controller already closed');
         }
      });
    },
    cancel() {
      // Note: We can't access the controller here, but connections will be cleaned up
      // when they fail to enqueue messages in broadcastNewScene
      console.log(`Stream cancelled for story ${storyId}`);
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    }
  });
}