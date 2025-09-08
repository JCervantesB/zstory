export interface GameMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    image?: GeneratedImage | string; // Can be GeneratedImage object or URL string
    imageUrl?: string; // URL of the uploaded image
    imageLoading?: boolean;
    imageError?: string; // Error message if image generation fails
    sceneId?: string; // ID of the associated scene for assistant messages
}

export interface GeneratedImage {
    base64Data: string;
    mediaType: string;
    unit8ArrayData?: Uint8Array;
}

export interface ConversationMessage {
    role: 'user' | 'assistant';
    content: string;
}

export interface GenerateStoryRequest {
    userMessage: string;
    conversationHistory: ConversationMessage[];
    isStart: boolean;
}

export interface GenerateImageRequest {
    imagePrompt: string;
    characterVisualPrompt?: string;
    includeCharacter?: boolean;
}

export interface GenerateStoryResponse {
    narrative: string;
    imagePrompt: string;
    characterVisualPrompt?: string;
    includeCharacter?: boolean;
    secondaryCharacterId?: string;
}