import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { gameSessions, gameScenes, users } from '@/db/schema';
import { eq, desc, count } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const offset = (page - 1) * limit;

    // Get public stories with user information
    const publicStories = await db
      .select({
        id: gameSessions.id,
        title: gameSessions.title,
        createdAt: gameSessions.createdAt,
        lastActive: gameSessions.lastActive,
        isCompleted: gameSessions.isCompleted,
        userName: users.name,
        characterName: users.characterName,
        characterLastName: users.characterLastName,
        characterImageUrl: users.characterImageUrl,
      })
      .from(gameSessions)
      .innerJoin(users, eq(gameSessions.userId, users.id))
      .where(eq(gameSessions.isPublic, true))
      .orderBy(desc(gameSessions.lastActive))
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    const totalCountResult = await db
      .select({ count: count() })
      .from(gameSessions)
      .where(eq(gameSessions.isPublic, true));

    const totalCount = totalCountResult[0]?.count || 0;
    const totalPages = Math.ceil(totalCount / limit);

    // Get scene count for each story
    const storiesWithSceneCount = await Promise.all(
      publicStories.map(async (story) => {
        const sceneCountResult = await db
          .select({ count: count() })
          .from(gameScenes)
          .where(eq(gameScenes.sessionId, story.id));
        
        const sceneCount = sceneCountResult[0]?.count || 0;
        
        return {
          ...story,
          sceneCount,
          characterFullName: story.characterName && story.characterLastName 
            ? `${story.characterName} ${story.characterLastName}`
            : story.characterName || 'Personaje Anónimo'
        };
      })
    );

    return NextResponse.json({
      stories: storiesWithSceneCount,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    console.error('Error fetching public stories:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}