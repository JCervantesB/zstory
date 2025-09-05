import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { gameSessions, gameScenes, users } from '@/db/schema';
import { eq, and, asc } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get the public story with user information
    const storyResult = await db
      .select({
        id: gameSessions.id,
        title: gameSessions.title,
        createdAt: gameSessions.createdAt,
        lastActive: gameSessions.lastActive,
        isCompleted: gameSessions.isCompleted,
        isPublic: gameSessions.isPublic,
        userName: users.name,
        characterName: users.characterName,
        characterLastName: users.characterLastName,
        characterImageUrl: users.characterImageUrl,
        characterDescription: users.characterDescription,
        characterSpecialty: users.characterSpecialty,
      })
      .from(gameSessions)
      .innerJoin(users, eq(gameSessions.userId, users.id))
      .where(and(
        eq(gameSessions.id, id),
        eq(gameSessions.isPublic, true)
      ))
      .limit(1);

    if (storyResult.length === 0) {
      return NextResponse.json(
        { error: 'Historia no encontrada o no es pública' },
        { status: 404 }
      );
    }

    const story = storyResult[0];

    // Get all scenes for this story
    const scenes = await db
      .select({
        id: gameScenes.id,
        order: gameScenes.order,
        narrativeText: gameScenes.narrativeText,
        imageUrl: gameScenes.imageUrl,
        createdAt: gameScenes.createdAt,
      })
      .from(gameScenes)
      .where(eq(gameScenes.sessionId, id))
      .orderBy(asc(gameScenes.order));

    const characterFullName = story.characterName && story.characterLastName 
      ? `${story.characterName} ${story.characterLastName}`
      : story.characterName || 'Personaje Anónimo';

    return NextResponse.json({
      story: {
        ...story,
        characterFullName,
        sceneCount: scenes.length,
      },
      scenes,
    });
  } catch (error) {
    console.error('Error fetching public story:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}