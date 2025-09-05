import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
  created_at: string;
  bytes: number;
}

export interface UploadImageOptions {
  folder?: string;
  public_id?: string;
  width?: number;
  height?: number;
  crop?: string;
  quality?: string | number;
  format?: string;
}

/**
 * Upload a base64 image to Cloudinary
 * @param base64Data - Base64 encoded image data
 * @param mediaType - MIME type of the image (e.g., 'image/png')
 * @param options - Upload options
 * @returns Promise with Cloudinary upload result
 */
export async function uploadImageToCloudinary(
  base64Data: string,
  mediaType: string,
  options: UploadImageOptions = {}
): Promise<CloudinaryUploadResult> {
  try {
    const dataUrl = `data:${mediaType};base64,${base64Data}`;
    
    const uploadOptions = {
      folder: options.folder || 'zombie-story/scenes',
      public_id: options.public_id || `scene_${Date.now()}`,
      resource_type: 'image' as const,
      format: options.format || 'webp',
      transformation: [
        {
          width: options.width || 512,
          height: options.height || 512,
          crop: options.crop || 'fill'
        },
        {
          quality: options.quality || 'auto'
        }
      ],
    };

    const result = await cloudinary.uploader.upload(dataUrl, uploadOptions);
    
    return {
      secure_url: result.secure_url,
      public_id: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      resource_type: result.resource_type,
      created_at: result.created_at,
      bytes: result.bytes,
    };
  } catch (error) {
    console.error('Error uploading image to Cloudinary:', error);
    throw new Error(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Upload avatar image to Cloudinary
 * @param base64Data - Base64 encoded image data
 * @param mediaType - MIME type of the image
 * @param userId - User ID for the public_id
 * @returns Promise with Cloudinary upload result
 */
export async function uploadAvatarToCloudinary(
  base64Data: string,
  mediaType: string,
  userId: string
): Promise<CloudinaryUploadResult> {
  return uploadImageToCloudinary(base64Data, mediaType, {
    folder: 'zombie-story/avatars',
    public_id: `avatar_${userId}_${Date.now()}`,
    width: 512,
    height: 512,
    crop: 'fill',
    quality: 'auto',
    format: 'webp'
  });
}

/**
 * Upload scene image to Cloudinary
 * @param base64Data - Base64 encoded image data
 * @param mediaType - MIME type of the image
 * @param sessionId - Session ID for the public_id
 * @param sceneOrder - Scene order number
 * @returns Promise with Cloudinary upload result
 */
export async function uploadSceneToCloudinary(
  base64Data: string,
  mediaType: string,
  sessionId: string,
  sceneOrder: number
): Promise<CloudinaryUploadResult> {
  return uploadImageToCloudinary(base64Data, mediaType, {
    folder: 'zombie-story/scenes',
    public_id: `scene_${sessionId}_${sceneOrder}_${Date.now()}`,
    width: 800,
    height: 450,
    crop: 'fill',
    quality: 'auto',
    format: 'webp'
  });
}

export { cloudinary };