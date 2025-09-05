import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { gameScenes, gameSessions } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; sceneId: string }> }
) {
  try {
    const { id: storyId, sceneId } = await params;

    // Verify story exists and is public
    const story = await db.select()
      .from(gameSessions)
      .where(and(
        eq(gameSessions.id, storyId),
        eq(gameSessions.isPublic, true)
      ))
      .limit(1);

    if (!story.length) {
      return NextResponse.json(
        { error: 'Story not found or not public' },
        { status: 404 }
      );
    }

    // Get the specific scene
    const scene = await db.select()
      .from(gameScenes)
      .where(and(
        eq(gameScenes.sessionId, storyId),
        eq(gameScenes.id, sceneId)
      ))
      .limit(1);

    if (!scene.length) {
      return NextResponse.json(
        { error: 'Scene not found' },
        { status: 404 }
      );
    }

    // Transform the data to match the expected format
    const transformedScene = {
      id: scene[0].id,
      order: scene[0].order,
      narrativeText: scene[0].narrativeText,
      imageUrl: scene[0].imageUrl,
      createdAt: scene[0].createdAt
    };

    return NextResponse.json(transformedScene);
  } catch (error) {
    console.error('Error in scene API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}