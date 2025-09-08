import { google } from '@ai-sdk/google';
import { generateText } from 'ai';

import { NextResponse, type NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { db } from '@/db';
import { gameScenes, users, gameSessions } from '@/db/schema';
import { eq, desc, sql } from 'drizzle-orm';

import { GAME_PROMPTS } from '@/lib/prompts';
import { GAME_CONFIG } from '@/lib/consts';
import { GenerateStoryRequest } from '@/lib/types';

export async function POST(request: NextRequest) {
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

    // Get user character data from database
    const [userData] = await db.select({
      characterName: users.characterName,
      characterLastName: users.characterLastName,
      characterDescription: users.characterDescription,
      characterSpecialty: users.characterSpecialty,
      characterVisualPrompt: users.characterVisualPrompt,
      characterSelectedItems: users.characterSelectedItems,
      characterOriginLocation: users.characterOriginLocation,
      characterCurrentLocation: users.characterCurrentLocation
    })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

    const { userMessage, conversationHistory, isStart }: GenerateStoryRequest = await request.json();

    // Prepare character information for the prompt
    let characterInfo: {
      name: string;
      lastName: string;
      description: string;
      specialty: string;
      visualPrompt: string;
      originLocation?: string;
      currentLocation?: string;
    } | undefined = undefined;
    if (userData && userData.characterName) {
      // Clean the visual prompt by removing the avatar generation prefix
      let cleanVisualPrompt = userData.characterVisualPrompt || '';
      if (cleanVisualPrompt.startsWith('Generate a pixel art style character avatar image with the following description:')) {
        cleanVisualPrompt = cleanVisualPrompt.replace('Generate a pixel art style character avatar image with the following description:', '').trim();
      }

      characterInfo = {
        name: userData.characterName,
        lastName: userData.characterLastName || '',
        description: userData.characterDescription || '',
        specialty: userData.characterSpecialty || '',
        visualPrompt: cleanVisualPrompt,
        originLocation: userData.characterOriginLocation || '',
        currentLocation: userData.characterCurrentLocation || ''
      };
    }

    // Smart secondary character inclusion system
    let secondaryCharacter: {
      id: string;
      name: string;
      lastName: string;
      description: string;
      visualPrompt: string;
    } | undefined = undefined;

    if (!isStart) {
      try {
        // Get current user's active session
        const userSessions = await db
          .select()
          .from(gameSessions)
          .where(eq(gameSessions.userId, session.user.id))
          .orderBy(desc(gameSessions.lastActive))
          .limit(1);
        
        if (userSessions.length === 0) {
          return NextResponse.json(
            { error: 'No se encontró una sesión activa' },
            { status: 404 }
          );
        }
        
        const currentSession = userSessions[0];
        
        // Get current session scenes to analyze secondary character frequency
        const sessionScenes = await db.select({
          secondaryCharacterId: gameScenes.secondaryCharacterId,
        })
        .from(gameScenes)
        .where(eq(gameScenes.sessionId, currentSession.id));

        const totalScenes = sessionScenes.length;
        const scenesWithSecondaryCharacters = sessionScenes.filter(scene => scene.secondaryCharacterId).length;
        
        // Calculate dynamic probability based on session progress and current frequency
        let baseChance = 0.15; // Base 15% chance
        
        // Reduce chance if secondary characters appeared recently
        if (totalScenes > 0) {
          const currentFrequency = scenesWithSecondaryCharacters / totalScenes;
          const targetFrequency = 0.2; // Target 20% overall frequency
          
          // If we're above target frequency, reduce chance significantly
          if (currentFrequency > targetFrequency) {
            baseChance = Math.max(0.05, baseChance * (targetFrequency / currentFrequency));
          }
          // If we're below target and have enough scenes, increase chance
          else if (totalScenes >= 3 && currentFrequency < targetFrequency * 0.5) {
            baseChance = Math.min(0.35, baseChance * 1.5);
          }
        }
        
        // Additional cooldown: check if a secondary character appeared in the last 2 scenes
        const recentScenes = sessionScenes.slice(-2);
        const hasRecentSecondaryCharacter = recentScenes.some(scene => scene.secondaryCharacterId);
        
        if (hasRecentSecondaryCharacter) {
          baseChance *= 0.3; // Reduce chance by 70% if appeared recently
        }

        if (Math.random() < baseChance) {
          // Get list of characters that haven't appeared recently in this session
          const recentCharacterIds = sessionScenes.slice(-3)
            .map(scene => scene.secondaryCharacterId)
            .filter(Boolean);
          
          const otherUsers = await db.select({
            id: users.id,
            characterName: users.characterName,
            characterLastName: users.characterLastName,
            characterDescription: users.characterDescription,
            characterVisualPrompt: users.characterVisualPrompt,
          })
          .from(users)
          .where(
            sql`${users.id} != ${session.user.id} AND ${users.characterName} IS NOT NULL AND ${users.id} NOT IN (${recentCharacterIds.length > 0 ? recentCharacterIds.map(() => '?').join(',') : 'NULL'})`
          )
          .limit(15);

          if (otherUsers.length > 0) {
            const randomUser = otherUsers[Math.floor(Math.random() * otherUsers.length)];
            
            // Clean the visual prompt for the secondary character
            let cleanSecondaryVisualPrompt = randomUser.characterVisualPrompt || '';
            if (cleanSecondaryVisualPrompt.startsWith('Generate a pixel art style character avatar image with the following description:')) {
              cleanSecondaryVisualPrompt = cleanSecondaryVisualPrompt.replace('Generate a pixel art style character avatar image with the following description:', '').trim();
            }

            secondaryCharacter = {
              id: randomUser.id,
              name: randomUser.characterName || 'Personaje Desconocido',
              lastName: randomUser.characterLastName || '',
              description: randomUser.characterDescription || '',
              visualPrompt: cleanSecondaryVisualPrompt
            };
          }
        }
      } catch (error) {
        console.error('Error fetching secondary character:', error);
        // Continue without secondary character if there's an error
      }
    }

    let prompt: string;
    if (isStart) {
      prompt = GAME_PROMPTS.INITIAL_STORY(characterInfo);
    } else {
      const historyText = conversationHistory.map(
        (message) => `${message.role}: ${message.content}`
      ).join('\n');
      prompt = GAME_PROMPTS.CONTINUE_STORY(historyText, userMessage, characterInfo, secondaryCharacter);
    }

    const { text } = await generateText({
      model: google('gemini-2.5-flash-lite'),
      prompt,
    });

    const [narrative, imagePrompt] = text.split(GAME_CONFIG.IMAGE.SEPARATOR);

    // Detectar si la imagen incluye un personaje basándose en palabras clave
    const includeCharacter = imagePrompt && (
      imagePrompt.toLowerCase().includes('character') ||
      imagePrompt.toLowerCase().includes('person') ||
      imagePrompt.toLowerCase().includes('protagonist') ||
      imagePrompt.toLowerCase().includes('survivor') ||
      imagePrompt.toLowerCase().includes('player') ||
      imagePrompt.toLowerCase().includes('man') ||
      imagePrompt.toLowerCase().includes('woman') ||
      imagePrompt.toLowerCase().includes('figure') ||
      imagePrompt.toLowerCase().includes('human')
    );

    return NextResponse.json({ 
      narrative, 
      imagePrompt,
      characterVisualPrompt: includeCharacter ? characterInfo?.visualPrompt : undefined,
      includeCharacter,
      secondaryCharacterId: secondaryCharacter?.id
    });

  } catch (error) {
    console.error('Error generating story:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
