import { useCallback, useEffect, useRef, useState } from 'react';
import type { GameScene } from '@/db/schema';

interface StreamEvent {
  type: 'connected' | 'new_scene' | 'heartbeat';
  storyId?: string;
  scene?: GameScene;
  imageUrl?: string;
  timestamp?: string;
}

interface UseStoryStreamProps {
  storyId: string;
  onNewScene?: (scene: GameScene) => void;
  enabled?: boolean;
}

export function useStoryStream({ storyId, onNewScene, enabled = true }: UseStoryStreamProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const onNewSceneRef = useRef(onNewScene);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const maxReconnectAttempts = 5;

  // Update the ref when onNewScene changes
  useEffect(() => {
    onNewSceneRef.current = onNewScene;
  }, [onNewScene]);

  const connect = useCallback(() => {
    if (!enabled || !storyId) return;

    try {
      // Close existing connection
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      const eventSource = new EventSource(`/api/stories/${storyId}/stream`);
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        console.log('SSE connection opened for story:', storyId);
        setIsConnected(true);
        setConnectionError(null);
        setReconnectAttempts(0);
      };

      eventSource.onmessage = (event) => {
        try {
          const data: StreamEvent = JSON.parse(event.data);
          
          switch (data.type) {
            case 'connected':
              console.log('Connected to story stream:', data.storyId);
              break;
            case 'new_scene':
              console.log('New scene received:', data.scene);
              if (onNewSceneRef.current && data.scene) {
                onNewSceneRef.current({
                  ...data.scene,
                  imageUrl: data.imageUrl || ''
                });
              }
              break;
            case 'heartbeat':
              // Heartbeat received - connection is alive
              // Reset reconnect attempts on successful heartbeat
              setReconnectAttempts(0);
              setConnectionError(null);
              break;
            default:
              console.log('Unknown event type:', data.type);
          }
        } catch (error) {
          console.error('Error parsing SSE message:', error);
        }
      };

      eventSource.onerror = (error) => {
        console.error('SSE connection error:', error);
        setIsConnected(false);
        
        if (eventSource.readyState === EventSource.CLOSED) {
          setConnectionError('Conexión cerrada');
          
          // Attempt to reconnect with exponential backoff
          setReconnectAttempts(currentAttempts => {
            if (currentAttempts < maxReconnectAttempts) {
              const delay = Math.min(1000 * Math.pow(2, currentAttempts), 30000);
              console.log(`Attempting to reconnect in ${delay}ms (attempt ${currentAttempts + 1}/${maxReconnectAttempts})`);
              
              reconnectTimeoutRef.current = setTimeout(() => {
                connect();
              }, delay);
              
              return currentAttempts + 1;
            } else {
              setConnectionError('No se pudo reconectar después de varios intentos');
              return currentAttempts;
            }
          });
        }
      };

    } catch (error) {
      console.error('Error creating SSE connection:', error);
      setConnectionError('Error al crear la conexión');
    }
  }, [enabled, storyId, maxReconnectAttempts]);

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    setIsConnected(false);
    setConnectionError(null);
    setReconnectAttempts(0);
  }, []);

  useEffect(() => {
    if (enabled && storyId) {
      connect();
    }

    return () => {
      disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storyId, enabled]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    isConnected,
    connectionError,
    reconnectAttempts,
    connect,
    disconnect
  };
}