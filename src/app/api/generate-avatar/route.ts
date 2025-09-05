import { NextRequest, NextResponse } from 'next/server';
import { generateText } from 'ai';
import { google } from '@ai-sdk/google';
import { v2 as cloudinary } from 'cloudinary';
import { buildAvatarPrompt } from '@/lib/character-customization';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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

    const { characterVisualPrompt } = await request.json();

    if (!characterVisualPrompt) {
      return NextResponse.json(
        { error: 'characterVisualPrompt es requerido' },
        { status: 400 }
      );
    }

    // Construir el prompt completo usando la función buildAvatarPrompt
    const fullPrompt = buildAvatarPrompt(
      characterVisualPrompt
    );

    // Generate image using Google Gemini 2.5 Flash Image Preview
    const { files } = await generateText({
      model: google('gemini-2.5-flash-image-preview'),
      prompt: fullPrompt,
      providerOptions: {
        google: {
          responseModalities: ['IMAGE']
        }
      }
    });

    console.log('Generated avatar files:', files);
    
    if (!files || files.length === 0) {
      throw new Error('No image generated from Google Gemini. The model may not support image generation.');
    }
    
    const imageFile = files[0];
    console.log('✅ Successfully generated avatar image!');
    console.log('📊 Image file type:', imageFile.mediaType);
    console.log('📊 Image file size:', imageFile.uint8Array?.length || 'unknown');
    
    // Convert imageFile to data URL for immediate display and Cloudinary upload
    const dataUrl = `data:${imageFile.mediaType};base64,${imageFile.base64}`;
    
    // Upload to Cloudinary for permanent storage
    const uploadResult = await cloudinary.uploader.upload(dataUrl, {
      folder: 'zombie-story/avatars',
      public_id: `avatar_${session.user.id}_${Date.now()}`,
      resource_type: 'image',
      format: 'webp',
      transformation: [
        { width: 512, height: 512, crop: 'fill' },
        { quality: 'auto' }
      ],
    });

    console.log('✅ Successfully uploaded to Cloudinary:', uploadResult.secure_url);

    // Update user's characterVisualPrompt with the full prompt used for generation
    await db.update(users)
      .set({ characterVisualPrompt: fullPrompt })
      .where(eq(users.id, session.user.id));

    console.log('✅ Successfully updated characterVisualPrompt in database');

    // Return both URLs: data URL for immediate display, Cloudinary URL for saving
    return NextResponse.json({
      success: true,
      imageUrl: dataUrl, // For immediate display in DOM
      avatarUrl: uploadResult.secure_url, // For saving to database
      cloudinaryUrl: uploadResult.secure_url, // Alternative property name
      message: 'Avatar generated and uploaded successfully'
    });

  } catch (error) {
    console.error('Error generating avatar:', error);
    
    return NextResponse.json(
      { 
        error: 'Error interno del servidor al generar el avatar',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}