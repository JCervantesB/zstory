import { google } from '@ai-sdk/google';
import { generateText } from 'ai';

import { NextResponse, type NextRequest } from 'next/server';

import { GAME_PROMPTS } from '@/lib/prompts';
import { GenerateImageRequest } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const { imagePrompt, characterVisualPrompt, includeCharacter }: GenerateImageRequest = await request.json();

    const prompt = GAME_PROMPTS.GENERATE_IMAGE(imagePrompt, characterVisualPrompt, includeCharacter);

    const { files } = await generateText({
        model: google('gemini-2.5-flash-image-preview'),
        prompt,
        providerOptions: {
            google: {
                responseModalities: ['IMAGE']
            }
        }
    })
    console.log('Generated images', files);

    // Extract base64 data from the file object
    const imageFile = files[0];
    if (!imageFile || !imageFile.base64) {
      return NextResponse.json({ error: 'No image generated' }, { status: 500 });
    }

    return NextResponse.json({ 
      image: imageFile.base64,
      mediaType: imageFile.mediaType || 'image/png'
    });

  } catch (error) {
    console.error('Error generating story:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
    
}
