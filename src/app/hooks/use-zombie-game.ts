import { useState, useEffect, useCallback } from 'react';
import { useSession } from '@/lib/auth-client';
import type { GameMessage, GenerateStoryResponse } from '@/lib/types';
import type { GameSession, GameScene } from '@/db/schema';

// Función para simular streaming de texto
const streamText = (text: string, onUpdate: (chunk: string) => void, onComplete?: () => void) => {
    let currentIndex = 0;
    const words = text.split(' ');
    
    const streamNextWord = () => {
        if (currentIndex < words.length) {
            const currentText = words.slice(0, currentIndex + 1).join(' ');
            onUpdate(currentText);
            currentIndex++;
            
            // Velocidad de streaming: 50-150ms por palabra
            const delay = Math.random() * 100 + 50;
            setTimeout(streamNextWord, delay);
        } else {
            onComplete?.();
        }
    };
    
    streamNextWord();
};

export function useZombieGame(sessionId?: string) {
    const { data: session } = useSession();
    const [messages, setMessages] = useState<GameMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [currentGameSession, setCurrentGameSession] = useState<GameSession | null>(null);
    const [sceneOrder, setSceneOrder] = useState(0);

    const generateAndSaveImage = useCallback(async (
        messageId: string, 
        imagePrompt: string, 
        narrativeText: string,
        sessionId: string,
        order: number,
        characterVisualPrompt?: string, 
        includeCharacter?: boolean,
        secondaryCharacterId?: string
    ) => {
        try {
            console.log('🎨 Iniciando generación de imagen...');
            
            // Generar imagen
            const imageResponse = await fetch('/api/generate-image', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    imagePrompt: imagePrompt,
                    characterVisualPrompt,
                    includeCharacter
                })
            });
    
            if (!imageResponse.ok) {
                const errorData = await imageResponse.json().catch(() => ({ error: 'Error desconocido' }));
                throw new Error(`Error al generar la imagen: ${errorData.error || imageResponse.statusText}`);
            }
    
            const imageData = await imageResponse.json();
            console.log('✅ Imagen generada exitosamente');
            
            // Subir imagen a Cloudinary y guardar escena
            console.log('☁️ Subiendo imagen a Cloudinary...');
            const uploadResponse = await fetch('/api/upload-scene', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    base64Image: imageData.image,
                    sessionId: sessionId,
                    order: order,
                    narrativeText: narrativeText,
                    secondaryCharacterId: secondaryCharacterId,
                    mediaType: imageData.mediaType || 'image/png'
                })
            });
            
            if (!uploadResponse.ok) {
                const errorData = await uploadResponse.json().catch(() => ({ error: 'Error desconocido' }));
                throw new Error(`Error al subir la imagen: ${errorData.error || uploadResponse.statusText}`);
            }
            
            const uploadResult = await uploadResponse.json();
            console.log('✅ Imagen subida y escena guardada exitosamente');
            
            // Broadcast nueva escena a lectores conectados (solo si la sesión es pública)
            if (currentGameSession?.isPublic) {
                try {
                    await fetch(`/api/stories/${sessionId}/broadcast`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            scene: uploadResult.scene,
                            imageUrl: uploadResult.imageUrl
                        })
                    });
                } catch (broadcastError) {
                    console.error('Error broadcasting scene:', broadcastError);
                }
            }
            
            // Actualizar mensaje con la imagen
            setMessages(prevMessages => prevMessages.map(message => {
                if (message.id === messageId) {
                    return {
                        ...message,
                        image: uploadResult.imageUrl,
                        imageLoading: false,
                        sceneId: uploadResult.scene.id
                    };
                }
                return message;
            }));
            
        } catch (error) {
            console.error('❌ Error al generar y guardar la imagen:', error);
            
            // Actualizar mensaje sin imagen en caso de error
            setMessages(prevMessages => prevMessages.map(message => {
                if (message.id === messageId) {
                    return {
                        ...message,
                        imageLoading: false,
                        imageError: error instanceof Error ? error.message : 'Error desconocido'
                    };
                }
                return message;
            }));
        }
    }, [currentGameSession?.isPublic]);

    const loadExistingSession = useCallback(async (gameSessionId: string) => {
        if (!session?.user?.id) return;
        
        try {
            setIsLoading(true);
            
            // Cargar sesión y escenas desde la API
            const response = await fetch(`/api/game-sessions/${gameSessionId}`);
            if (!response.ok) {
                throw new Error('Error al cargar la sesión');
            }

            const data = await response.json();
            const { session: gameSession, scenes } = data;
            
            setCurrentGameSession(gameSession);
            setSceneOrder(scenes.length);
            
            // Convertir escenas a mensajes
            const gameMessages: GameMessage[] = scenes.map((scene: GameScene) => ({
                id: scene.id,
                role: 'assistant' as const,
                content: scene.narrativeText,
                image: scene.imageUrl || undefined,
                imageLoading: false,
                sceneId: scene.id
            }));
            
            setMessages(gameMessages);
            
        } catch (error) {
            console.error('Error al cargar la sesión:', error);
        } finally {
            setIsLoading(false);
        }
    }, [session?.user?.id]);

    const checkForActiveSession = useCallback(async () => {
        if (!session?.user?.id) return;
        
        try {
            // Obtener perfil del usuario con currentSessionId
            const response = await fetch('/api/user/profile');
            if (!response.ok) {
                console.error('Error al obtener perfil de usuario');
                return;
            }
            
            const { user } = await response.json();
            
            if (user.currentSessionId) {
                // Cargar la sesión activa existente
                loadExistingSession(user.currentSessionId);
            }
            // Si no hay sesión activa, no hacer nada - esperar a que el usuario haga clic en "Nueva Historia"
        } catch (error) {
            console.error('Error al verificar sesión activa:', error);
            // En caso de error, no crear sesión automáticamente
        }
    }, [session?.user?.id, loadExistingSession]);

    useEffect(() => {
        if (session?.user?.id) {
            if (sessionId) {
                // Cargar sesión específica
                loadExistingSession(sessionId);
            } else {
                // Solo verificar si hay una sesión activa, no crear nueva automáticamente
                checkForActiveSession();
            }
        }
    }, [session?.user?.id, sessionId, loadExistingSession, checkForActiveSession]);

    const startNewGame = useCallback(async (title?: string) => {
        if (!session?.user?.id) return;
        
        setIsLoading(true);
        try {
            // Crear nueva sesión usando la API
            const response = await fetch('/api/game-sessions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: title || `Historia Zombie - ${new Date().toLocaleDateString()}`,
                }),
            });

            if (!response.ok) {
                throw new Error('Error al crear nueva sesión');
            }

            const data = await response.json();
            const newSession = data.session;
            
            setCurrentGameSession(newSession);
            setSceneOrder(0);
            
            // Generar la primera escena
            const storyResponse = await fetch('/api/generate-story', {
                method: 'POST',
                body: JSON.stringify({ isStart: true })
            });

            if (!storyResponse.ok) {
                throw new Error('Error al generar la historia');
            }
            const storyData = await storyResponse.json() as GenerateStoryResponse;

            const messageId = crypto.randomUUID();

            // Crear mensaje inicial vacío
            const newMessage: GameMessage = {
                id: messageId,
                role: 'assistant',
                content: '',
                imageLoading: true,
                sceneId: undefined
            };

            setMessages([newMessage]);
            
            // Iniciar streaming del texto
            streamText(
                storyData.narrative,
                (streamedContent) => {
                    setMessages(prevMessages => 
                        prevMessages.map(msg => 
                            msg.id === messageId 
                                ? { ...msg, content: streamedContent }
                                : msg
                        )
                    );
                },
                async () => {
                    // Cuando termine el streaming, generar y guardar la imagen
                    await generateAndSaveImage(
                        messageId, 
                        storyData.imagePrompt, 
                        storyData.narrative,
                        newSession.id,
                        0,
                        storyData.characterVisualPrompt, 
                        storyData.includeCharacter,
                        storyData.secondaryCharacterId
                    );
                }
            );

        } catch (error) {
            console.error('Error al generar la historia:', error);
        } finally {
            setIsLoading(false);
        }
    }, [session?.user?.id, generateAndSaveImage]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (input.trim() === '' || !currentGameSession) return;

        const userMessage: GameMessage = {
            id: crypto.randomUUID(),
            role: 'user',
            content: input,
        };

        setIsLoading(true);
        setInput('');
        setMessages(prevMessages => [...prevMessages, userMessage]);

        try {
            const response = await fetch('/api/generate-story', {
                method: 'POST',
                body: JSON.stringify({
                    userMessage: input,
                    conversationHistory: messages,
                    isStart: false,
                })
            });

            if (!response.ok) {
                throw new Error('Error al generar la historia');
            }
            const data = await response.json() as GenerateStoryResponse;

            const messageId = crypto.randomUUID();
            const nextOrder = sceneOrder + 1;

            // Crear mensaje inicial vacío
            const assistantMessage: GameMessage = {
                id: messageId,
                role: 'assistant',
                content: '',
                imageLoading: true,
                sceneId: undefined
            };
            
            setMessages(prevMessages => [...prevMessages, assistantMessage]);
            
            // Iniciar streaming del texto
            streamText(
                data.narrative,
                (streamedContent) => {
                    setMessages(prevMessages => 
                        prevMessages.map(msg => 
                            msg.id === messageId 
                                ? { ...msg, content: streamedContent }
                                : msg
                        )
                    );
                },
                async () => {
                    // Cuando termine el streaming, generar y guardar la imagen
                    await generateAndSaveImage(
                        messageId,
                        data.imagePrompt,
                        data.narrative,
                        currentGameSession.id,
                        nextOrder,
                        data.characterVisualPrompt,
                        data.includeCharacter,
                        data.secondaryCharacterId
                    );
                    
                    // Actualizar el orden de escenas
                    setSceneOrder(nextOrder);
                    
                    // Actualizar lastActive de la sesión
                    await fetch(`/api/game-sessions/${currentGameSession.id}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            lastActive: new Date().toISOString(),
                        }),
                    });
                }
            );
                    
        } catch (error) {
            console.error('Error al generar la historia:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInput(e.target.value);
    };

    const completeSession = useCallback(async () => {
        if (!currentGameSession) return;
        
        try {
            const response = await fetch(`/api/game-sessions/${currentGameSession.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    isCompleted: true,
                }),
            });

            if (!response.ok) {
                throw new Error('Error al completar sesión');
            }

            const data = await response.json();
            setCurrentGameSession(data.session);
        } catch (error) {
            console.error('Error al completar la sesión:', error);
        }
    }, [currentGameSession]);

    const getUserSessions = useCallback(async () => {
        if (!session?.user?.id) return [];

        try {
            const response = await fetch('/api/game-sessions');
            if (!response.ok) {
                throw new Error('Error al obtener sesiones');
            }

            const data = await response.json();
            return data.sessions;
        } catch (error) {
            console.error('Error obteniendo sesiones del usuario:', error);
            return [];
        }
    }, [session?.user?.id]);

    const deleteScene = useCallback(async (sceneId: string) => {
        if (!currentGameSession) return false;
        
        try {
            const response = await fetch(`/api/game-sessions/${currentGameSession.id}/scenes/${sceneId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Error al eliminar escena');
            }

            const data = await response.json();
            
            // Recargar la sesión para obtener las escenas actualizadas
            await loadExistingSession(currentGameSession.id);
            
            return true;
        } catch (error) {
            console.error('Error al eliminar escena:', error);
            return false;
        }
    }, [currentGameSession, loadExistingSession]);

    const regenerateScene = useCallback(async (sceneId: string) => {
        if (!currentGameSession) return false;
        
        setIsLoading(true);
        try {
            // Encontrar el mensaje correspondiente a la escena
            const messageIndex = messages.findIndex(msg => 
                msg.role === 'assistant' && msg.sceneId === sceneId
            );
            
            if (messageIndex === -1) {
                throw new Error('No se encontró el mensaje correspondiente a la escena');
            }

            // Obtener el mensaje del usuario anterior (el prompt original)
            const userMessageIndex = messageIndex - 1;
            const userMessage = userMessageIndex >= 0 ? messages[userMessageIndex].content : '';
            
            const response = await fetch(`/api/game-sessions/${currentGameSession.id}/scenes/${sceneId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userMessage: userMessage
                })
            });

            if (!response.ok) {
                throw new Error('Error al regenerar escena');
            }

            const data = await response.json();
            
            // Actualizar el mensaje con el nuevo contenido
            setMessages(prevMessages => 
                prevMessages.map(msg => 
                    msg.sceneId === sceneId 
                        ? { 
                            ...msg, 
                            content: data.storyData.narrative,
                            image: data.scene.imageUrl,
                            imageLoading: false
                        }
                        : msg
                )
            );
            
            return true;
        } catch (error) {
            console.error('Error al regenerar escena:', error);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [currentGameSession, messages]);

    return {
        messages,
        input,
        isLoading,
        currentGameSession,
        setCurrentGameSession,
        startGame: startNewGame,
        handleSubmit,
        setInput,
        handleInputChange,
        completeSession,
        loadExistingSession,
        getUserSessions,
        deleteScene,
        regenerateScene
    };
}
