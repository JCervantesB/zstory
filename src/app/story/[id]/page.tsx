'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Clock, User, BookOpen, Calendar, ChevronLeft, ChevronRight, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { formatDistanceToNow, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useParams } from 'next/navigation';
import { useStoryStream } from '@/app/hooks/use-story-stream';
import { toast } from 'sonner';
import { NavigationHeader } from '@/components/ui/navigation-header';
import type { GameScene } from '@/db/schema';

interface StoryData {
  id: string;
  title: string;
  createdAt: string;
  lastActive: string;
  isCompleted: boolean;
  userName: string;
  characterFullName: string;
  characterImageUrl: string | null;
  characterDescription: string | null;
  characterSpecialty: string | null;
  sceneCount: number;
}

interface Scene {
  id: string;
  order: number;
  narrativeText: string;
  imageUrl: string | null;
  createdAt: string;
}

export default function StoryPage() {
  const params = useParams();
  const storyId = params.id as string;
  
  const [story, setStory] = useState<StoryData | null>(null);
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newScenesCount, setNewScenesCount] = useState(0);
  const [refreshingScene, setRefreshingScene] = useState(false);
  const [imageKey, setImageKey] = useState(0);

  // Handle new scenes from SSE
  const handleNewScene = (newScene: GameScene) => {
    setScenes(prevScenes => {
      // Check if scene already exists
      const sceneExists = prevScenes.some(scene => scene.id === newScene.id);
      if (sceneExists) return prevScenes;
      
      const updatedScenes = [...prevScenes, newScene];
      
      setNewScenesCount(prev => prev + 1);
      toast.success('¡Nueva escena añadida a la historia!', {
        description: 'La historia continúa en tiempo real',
        action: {
          label: 'Ver',
          onClick: () => {
            setCurrentSceneIndex(updatedScenes.length - 1);
            setNewScenesCount(0);
          }
        }
      });
      
      return updatedScenes;
    });
  };

  // SSE connection for real-time updates
  const { isConnected } = useStoryStream({
    storyId,
    onNewScene: handleNewScene,
    enabled: !!story && !loading
  });

  useEffect(() => {
    const fetchStory = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/public-stories/${storyId}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Historia no encontrada o no es pública');
          }
          throw new Error('Error al cargar la historia');
        }

        const data = await response.json();
        setStory(data.story);
        setScenes(data.scenes);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    if (storyId) {
      fetchStory();
    }
  }, [storyId]);

  const currentScene = scenes[currentSceneIndex];
  const hasNextScene = currentSceneIndex < scenes.length - 1;
  const hasPreviousScene = currentSceneIndex > 0;

  const goToNextScene = () => {
    if (hasNextScene) {
      setCurrentSceneIndex(currentSceneIndex + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goToPreviousScene = () => {
    if (hasPreviousScene) {
      setCurrentSceneIndex(currentSceneIndex - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const refreshCurrentScene = async () => {
    if (!currentScene) return;
    
    setRefreshingScene(true);
    try {
      // Force image reload by changing the key
      setImageKey(prev => prev + 1);
      
      // Optional: Refetch the current scene data from the server
      const response = await fetch(`/api/stories/${storyId}/scenes/${currentScene.id}`);
      if (response.ok) {
        const updatedScene = await response.json();
        setScenes(prevScenes => 
          prevScenes.map(scene => 
            scene.id === currentScene.id ? updatedScene : scene
          )
        );
      }
      
      toast.success('Escena recargada', {
        description: 'La imagen y contenido han sido actualizados'
      });
    } catch (error) {
      console.error('Error refreshing scene:', error);
      toast.error('Error al recargar la escena');
    } finally {
      setRefreshingScene(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-red-900 to-black">
        <NavigationHeader 
          title="Cargando historia..."
          subtitle="Modo lectura"
          showBackToHome={true}
        />
        <div className="max-w-4xl mx-auto p-2 sm:p-4 lg:p-6">
          <div className="text-center py-8 sm:py-12">
            <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-white mx-auto"></div>
            <p className="text-white mt-3 sm:mt-4 text-sm sm:text-base">Cargando historia...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !story) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-red-900 to-black">
        <NavigationHeader 
          title="Error"
          subtitle="Historia no encontrada"
          showBackToHome={true}
        />
        <div className="max-w-4xl mx-auto p-2 sm:p-4 lg:p-6">
          <div className="text-center py-8 sm:py-12 px-4">
            <p className="text-red-400 text-base sm:text-lg mb-4 break-words">{error || 'Historia no encontrada'}</p>
            <Link href="/gallery">
              <Button variant="outline" className="w-full sm:w-auto">
                <ArrowLeft className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Volver a la Galería</span>
                <span className="sm:hidden">Galería</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-red-900 to-black">
      <NavigationHeader 
        title={story?.title || 'Cargando historia...'}
        subtitle="Modo lectura"
        showBackToHome={true}
      />
      <div className="max-w-4xl mx-auto p-2 sm:p-4 lg:p-6">
        {/* Story Header */}
        <div className="mb-4 sm:mb-6">
          
          <Card className="bg-black/40 border-purple-500/30">
            <CardHeader className="p-3 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start space-y-3 sm:space-y-0 sm:space-x-4">
                <Avatar className="h-12 w-12 sm:h-16 sm:w-16 mx-auto sm:mx-0">
                  <AvatarImage 
                    src={story.characterImageUrl || undefined} 
                    alt={story.characterFullName}
                  />
                  <AvatarFallback className="bg-purple-600 text-white text-lg sm:text-xl">
                    {story.characterFullName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-center sm:text-left w-full">
                  <CardTitle className="text-white text-lg sm:text-xl lg:text-2xl mb-2 break-words">
                    {story.title || 'Historia sin título'}
                  </CardTitle>
                  <div className="space-y-2">
                    <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start space-y-1 sm:space-y-0 sm:space-x-4 text-xs sm:text-sm text-gray-300">
                      <div className="flex items-center space-x-1">
                        <User className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="truncate">{story.characterFullName}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="truncate">por {story.userName}</span>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start space-y-1 sm:space-y-0 sm:space-x-4 text-xs sm:text-sm text-gray-400">
                      <div className="flex items-center space-x-1">
                        <BookOpen className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span>{story.sceneCount} escenas</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span>
                          {format(new Date(story.createdAt), 'dd/MM/yyyy', { locale: es })}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="truncate">
                          última actividad hace {formatDistanceToNow(new Date(story.lastActive), {
                            addSuffix: false,
                            locale: es,
                          })}
                        </span>
                      </div>
                    </div>
                    {(story.characterDescription || story.characterSpecialty) && (
                      <div className="mt-3 text-center sm:text-left">
                        {story.characterDescription && (
                          <p className="text-gray-300 text-xs sm:text-sm mb-1 break-words">
                            {story.characterDescription}
                          </p>
                        )}
                        {story.characterSpecialty && (
                          <Badge variant="secondary" className="text-xs">
                            {story.characterSpecialty}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Scene Navigation */}
        {scenes.length > 0 && (
          <div className="mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row items-center justify-between mb-3 sm:mb-4 space-y-2 sm:space-y-0">
              <h2 className="text-lg sm:text-xl font-semibold text-white text-center sm:text-left">
                Escena {currentSceneIndex + 1} de {scenes.length}
              </h2>
              <div className="flex items-center space-x-2">
                {/* Connection Status */}
                <div className="flex items-center space-x-1 mr-2">
                  {isConnected ? (
                    <div title="Conectado - Recibiendo actualizaciones en tiempo real">
                      <Wifi className="h-4 w-4 text-green-500" />
                    </div>
                  ) : (
                    <div title="Desconectado">
                      <WifiOff className="h-4 w-4 text-red-500" />
                    </div>
                  )}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToPreviousScene}
                  disabled={!hasPreviousScene}
                  className="p-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="sr-only">Escena anterior</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={refreshCurrentScene}
                  disabled={refreshingScene}
                  className="p-2"
                  title="Recargar escena actual"
                >
                  <RefreshCw className={`h-4 w-4 ${refreshingScene ? 'animate-spin' : ''}`} />
                  <span className="sr-only">Recargar escena</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToNextScene}
                  disabled={!hasNextScene}
                  className="p-2 relative"
                >
                  <ChevronRight className="h-4 w-4" />
                  {newScenesCount > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs bg-red-500">
                      {newScenesCount}
                    </Badge>
                  )}
                  <span className="sr-only">Siguiente escena</span>
                </Button>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-700 rounded-full h-2 mb-4 sm:mb-6">
              <div 
                className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentSceneIndex + 1) / scenes.length) * 100}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Current Scene */}
        {currentScene && (
          <Card className="bg-black/40 border-purple-500/30 mb-4 sm:mb-6">
            <CardContent className="p-3 sm:p-6">
              {/* Scene Image */}
              {currentScene.imageUrl && (
                <div className="mb-4 sm:mb-6">
                  <div className="relative aspect-video rounded-lg overflow-hidden">
                    <Image
                      key={`scene-${currentScene.id}-${imageKey}`}
                      src={currentScene.imageUrl}
                      alt={`Escena ${currentScene.order}`}
                      fill
                      className="object-cover pixelated"
                      priority
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
                    />
                  </div>
                </div>
              )}
              
              {/* Scene Text */}
              <div className="prose prose-invert max-w-none">
                <p className="text-gray-200 leading-relaxed text-sm sm:text-base lg:text-lg whitespace-pre-wrap break-words">
                  {currentScene.narrativeText}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation Buttons */}
        {scenes.length > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 sm:mb-8 space-y-3 sm:space-y-0">
            <Button
              variant="outline"
              onClick={goToPreviousScene}
              disabled={!hasPreviousScene}
              className="flex items-center space-x-2 w-full sm:w-auto order-2 sm:order-1"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Escena Anterior</span>
              <span className="sm:hidden">Anterior</span>
            </Button>
            
            <div className="text-center order-1 sm:order-2">
              <p className="text-gray-400 text-sm">
                {currentSceneIndex + 1} / {scenes.length}
              </p>
            </div>
            
            <Button
              variant="outline"
              onClick={goToNextScene}
              disabled={!hasNextScene}
              className="flex items-center space-x-2 w-full sm:w-auto order-3"
            >
              <span className="hidden sm:inline">Siguiente Escena</span>
              <span className="sm:hidden">Siguiente</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* End of Story */}
        {!hasNextScene && scenes.length > 0 && (
          <Card className="bg-black/40 border-purple-500/30 text-center">
            <CardContent className="p-4 sm:p-6 lg:p-8">
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">
                🎉 Fin de la Historia
              </h3>
              <p className="text-gray-300 mb-4 sm:mb-6 text-sm sm:text-base">
                Has completado la lectura de esta épica aventura de supervivencia.
              </p>
              <Link href="/gallery">
                <Button className="bg-purple-600 hover:bg-purple-700 w-full sm:w-auto">
                  Explorar Más Historias
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}