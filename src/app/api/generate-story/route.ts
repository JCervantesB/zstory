import { google } from '@ai-sdk/google';
import { generateText } from 'ai';

import { NextResponse, type NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq, ne, sql } from 'drizzle-orm';

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

    // Randomly include a secondary character (10% chance)
    const shouldIncludeSecondary = Math.random() < 0.20;
    let secondaryCharacter: {
      name: string;
      lastName: string;
      description: string;
      visualPrompt: string;
    } | undefined = undefined;

    if (shouldIncludeSecondary && !isStart) {
      try {
        // Get a random character from another player
        const [randomUser] = await db.select({
          characterName: users.characterName,
          characterLastName: users.characterLastName,
          characterDescription: users.characterDescription,
          characterVisualPrompt: users.characterVisualPrompt,
        })
        .from(users)
        .where(
          ne(users.id, session.user.id) // Exclude current user
        )
        .orderBy(sql`RANDOM()`)
        .limit(1);

        if (randomUser && randomUser.characterName) {
          // Clean the visual prompt for the secondary character
          let cleanSecondaryVisualPrompt = randomUser.characterVisualPrompt || '';
          if (cleanSecondaryVisualPrompt.startsWith('Generate a pixel art style character avatar image with the following description:')) {
            cleanSecondaryVisualPrompt = cleanSecondaryVisualPrompt.replace('Generate a pixel art style character avatar image with the following description:', '').trim();
          }

          secondaryCharacter = {
            name: randomUser.characterName,
            lastName: randomUser.characterLastName || '',
            description: randomUser.characterDescription || '',
            visualPrompt: cleanSecondaryVisualPrompt
          };
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
      includeCharacter
    });

  } catch (error) {
    console.error('Error generating story:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
