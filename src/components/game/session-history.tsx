'use client';

import { useState, useEffect, useCallback } from 'react';
import { useZombieGame } from '@/app/hooks/use-zombie-game';
import { GameSession } from '@/db/schema';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, Play, Calendar, Clock, Share2, Globe, Lock, Edit2, Check, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';

interface SessionHistoryProps {
  onSessionSelect: (sessionId: string) => void;
  onNewSession: () => void;
}

export function SessionHistory({ onSessionSelect, onNewSession }: SessionHistoryProps) {
  const { getUserSessions } = useZombieGame();
  const [sessions, setSessions] = useState<GameSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingSessionId, setDeletingSessionId] = useState<string | null>(null);
  const [sharingSessionId, setSharingSessionId] = useState<string | null>(null);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState<string>('');


  const loadSessions = useCallback(async () => {
    setIsLoading(true);
    try {
      const userSessions = await getUserSessions();
      setSessions(userSessions);
    } catch (error) {
      console.error('Error cargando sesiones:', error);
    } finally {
      setIsLoading(false);
    }
  }, [getUserSessions]);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const handleDeleteSession = async (sessionId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta sesión? Esta acción no se puede deshacer.')) {
      return;
    }

    setDeletingSessionId(sessionId);
    try {
      const response = await fetch(`/api/game-sessions/${sessionId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error al eliminar la sesión');
      }

      // Recargar sesiones después de eliminar
      await loadSessions();
    } catch (error) {
      console.error('Error eliminando sesión:', error);
      alert('Error al eliminar la sesión. Por favor, inténtalo de nuevo.');
    } finally {
      setDeletingSessionId(null);
    }
  };

  const handleTogglePublic = async (sessionId: string, currentIsPublic: boolean) => {
    setSharingSessionId(sessionId);
    try {
      const response = await fetch(`/api/game-sessions/${sessionId}/public`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isPublic: !currentIsPublic }),
      });

      if (!response.ok) {
        throw new Error('Error al cambiar visibilidad');
      }

      // Actualizar el estado local
      setSessions(prev => prev.map(session => 
        session.id === sessionId 
          ? { ...session, isPublic: !currentIsPublic }
          : session
      ));

      toast.success(!currentIsPublic ? "Historia visible" : "Historia privada", {
        description: !currentIsPublic 
          ? "Tu historia es visible en la galería pública" 
          : "Tu historia ahora es privada y no aparece en la galería",
      });
    } catch (error) {
      console.error('Error:', error);
      toast.error("Error", {
        description: "No se pudo cambiar la visibilidad de la historia",
      });
    } finally {
      setSharingSessionId(null);
    }
  };



  const handleCopyPublicLink = (sessionId: string) => {
    const publicUrl = `${window.location.origin}/story/${sessionId}`;
    navigator.clipboard.writeText(publicUrl).then(() => {
      alert('¡Enlace copiado al portapapeles!');
    }).catch(() => {
      alert('Error al copiar el enlace');
    });
  };

  const handleStartEdit = (sessionId: string, currentTitle: string) => {
    setEditingSessionId(sessionId);
    setEditingTitle(currentTitle);
  };

  const handleCancelEdit = () => {
    setEditingSessionId(null);
    setEditingTitle('');
  };

  const handleSaveEdit = async (sessionId: string) => {
    if (!editingTitle.trim()) {
      alert('El título no puede estar vacío');
      return;
    }

    try {
      const response = await fetch(`/api/game-sessions/${sessionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: editingTitle.trim() }),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar el título');
      }

      // Recargar sesiones después de actualizar
      await loadSessions();
      setEditingSessionId(null);
      setEditingTitle('');
    } catch (error) {
      console.error('Error actualizando título:', error);
      alert('Error al actualizar el título. Por favor, inténtalo de nuevo.');
    }
  };

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return formatDistanceToNow(dateObj, { addSuffix: true, locale: es });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
        <span className="ml-2 text-gray-600">Cargando sesiones...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-xl sm:text-2xl font-bold text-white truncate">Historial de Sesiones</h2>
          <p className="text-sm sm:text-base text-gray-300 line-clamp-2 sm:line-clamp-1">Continúa una historia anterior o comienza una nueva</p>
        </div>
        <Button 
          onClick={onNewSession}
          className="bg-red-600 hover:bg-red-700 text-white flex-shrink-0 w-full sm:w-auto"
          size="sm"
        >
          <span className="sm:hidden">Nueva</span>
          <span className="hidden sm:inline">Nueva Historia</span>
        </Button>
      </div>

      {sessions.length === 0 ? (
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-gray-400 mb-4">
              <Calendar className="h-12 w-12" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              No tienes sesiones guardadas
            </h3>
            <p className="text-gray-300 text-center mb-4">
              Comienza tu primera aventura zombie y se guardará automáticamente
            </p>
            <Button 
              onClick={onNewSession}
              className="bg-red-600 hover:bg-red-700 text-white"
              data-tour="start-first-story-button"
            >
              Comenzar Primera Historia
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4">
          {sessions.map((session) => (
            <Card key={session.id} className="bg-gray-800 border-gray-700 hover:shadow-lg transition-all duration-200 hover:scale-[1.02] hover:border-gray-600">
              <CardHeader className="pb-2 px-4 py-4 sm:px-6 sm:py-5 lg:px-5 lg:py-4 xl:px-6 xl:py-5">
                <div className="flex items-start justify-between gap-2 sm:gap-3">
                  <div className="flex-1 min-w-0">
                    {editingSessionId === session.id ? (
                      <div className="flex items-center gap-1 mb-1">
                        <input
                          type="text"
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          className="flex-1 bg-gray-600 text-white text-sm px-2 py-1 rounded border border-gray-500 focus:border-blue-500 focus:outline-none"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveEdit(session.id);
                            if (e.key === 'Escape') handleCancelEdit();
                          }}
                          autoFocus
                        />
                        <Button
                          onClick={() => handleSaveEdit(session.id)}
                          variant="ghost"
                          size="sm"
                          className="text-green-400 hover:text-green-300 hover:bg-green-900/20 p-1 h-auto"
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                        <Button
                          onClick={handleCancelEdit}
                          variant="ghost"
                          size="sm"
                          className="text-red-400 hover:text-red-300 hover:bg-red-900/20 p-1 h-auto"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 group">
                        <CardTitle className="text-base lg:text-lg xl:text-base 2xl:text-lg line-clamp-2 text-white leading-tight flex-1">
                          {session.title}
                        </CardTitle>
                        <Button
                          onClick={() => handleStartEdit(session.id, session.title || '')}
                          variant="ghost"
                          size="sm"
                          className="opacity-50 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-gray-300 hover:bg-gray-600 p-1 h-auto"
                          data-tour="edit-title-button"
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                    <CardDescription className="flex items-center gap-1.5 mt-1 text-xs lg:text-sm xl:text-xs 2xl:text-sm text-gray-400">
                      <Clock className="h-3 w-3 lg:h-4 lg:w-4 xl:h-3 xl:w-3 2xl:h-4 2xl:w-4 flex-shrink-0" />
                      <span className="truncate">{formatDate(session.lastActive || session.createdAt)}</span>
                    </CardDescription>
                  </div>
                  <Badge 
                    variant={session.isCompleted ? 'secondary' : 'default'}
                    className={`text-xs lg:text-sm xl:text-xs 2xl:text-sm px-2 py-1 lg:px-3 lg:py-1.5 xl:px-2 xl:py-1 2xl:px-3 2xl:py-1.5 flex-shrink-0 ${
                      session.isCompleted ? 'bg-green-600 text-white' : 'bg-orange-600 text-white'
                    }`}
                  >
                    <span className="hidden sm:inline">{session.isCompleted ? 'Completada' : 'En progreso'}</span>
                    <span className="sm:hidden">{session.isCompleted ? 'OK' : 'En curso'}</span>
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0 pb-4 px-4 sm:px-6 sm:pb-5 lg:px-5 lg:pb-4 xl:px-6 xl:pb-5">
                <div className="flex flex-col gap-2 sm:gap-3 lg:gap-2.5 xl:gap-2 2xl:gap-3">
                  <div className="flex items-center justify-between gap-2 sm:gap-3">
                    <Button
                      onClick={() => onSessionSelect(session.id)}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1.5 sm:gap-2 border-gray-500 text-white hover:bg-gray-600 text-xs lg:text-sm xl:text-xs 2xl:text-sm px-3 py-2 lg:px-4 lg:py-2.5 xl:px-3 xl:py-2 2xl:px-4 2xl:py-2.5 h-auto flex-1"
                      data-tour="continue-story-button"
                    >
                      <Play className="h-3 w-3 lg:h-4 lg:w-4 xl:h-3 xl:w-3 2xl:h-4 2xl:w-4" />
                      <span className="hidden sm:inline">{session.isCompleted ? 'Ver Historia' : 'Continuar'}</span>
                      <span className="sm:hidden">{session.isCompleted ? 'Ver' : 'Continuar'}</span>
                    </Button>
                    <Button
                      onClick={() => handleDeleteSession(session.id)}
                      variant="ghost"
                      size="sm"
                      className="text-red-400 hover:text-red-300 hover:bg-red-900/20 p-1.5 lg:p-2 xl:p-1.5 2xl:p-2 h-auto flex-shrink-0"
                      disabled={deletingSessionId === session.id}
                    >
                      {deletingSessionId === session.id ? (
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-600"></div>
                      ) : (
                        <Trash2 className="h-3 w-3 lg:h-4 lg:w-4 xl:h-3 xl:w-3 2xl:h-4 2xl:w-4" />
                      )}
                    </Button>
                  </div>
                  
                  {/* Funcionalidad de visibilidad para todas las historias */}
                  <div className="flex items-center gap-2 sm:gap-3 pt-2 lg:pt-3 xl:pt-2 2xl:pt-3 border-t border-gray-600">
                    <Button
                      onClick={() => handleTogglePublic(session.id, session.isPublic ?? true)}
                      variant="ghost"
                      size="sm"
                      className={`flex items-center gap-1.5 sm:gap-2 text-xs lg:text-sm xl:text-xs 2xl:text-sm px-2 py-1.5 lg:px-3 lg:py-2 xl:px-2 xl:py-1.5 2xl:px-3 2xl:py-2 h-auto flex-1 ${
                        (session.isPublic ?? true)
                          ? 'text-green-400 hover:text-green-300 hover:bg-green-900/20' 
                          : 'text-red-400 hover:text-red-300 hover:bg-red-900/20'
                      }`}
                      disabled={sharingSessionId === session.id}
                      data-tour="toggle-visibility-button"
                    >
                      {sharingSessionId === session.id ? (
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
                      ) : (session.isPublic ?? true) ? (
                        <Globe className="h-3 w-3 lg:h-4 lg:w-4 xl:h-3 xl:w-3 2xl:h-4 2xl:w-4" />
                      ) : (
                        <Lock className="h-3 w-3 lg:h-4 lg:w-4 xl:h-3 xl:w-3 2xl:h-4 2xl:w-4" />
                      )}
                      <span className="hidden sm:inline">
                        {(session.isPublic ?? true) ? 'Visible' : 'Privada'}
                      </span>
                    </Button>
                    
                    {(session.isPublic ?? true) && (
                      <Button
                        onClick={() => handleCopyPublicLink(session.id)}
                        variant="ghost"
                        size="sm"
                        className="flex items-center gap-1.5 sm:gap-2 text-blue-400 hover:text-blue-300 hover:bg-blue-900/20 text-xs lg:text-sm xl:text-xs 2xl:text-sm px-2 py-1.5 lg:px-3 lg:py-2 xl:px-2 xl:py-1.5 2xl:px-3 2xl:py-2 h-auto flex-shrink-0"
                        data-tour="share-link-button"
                      >
                        <Share2 className="h-3 w-3 lg:h-4 lg:w-4 xl:h-3 xl:w-3 2xl:h-4 2xl:w-4" />
                        <span className="hidden sm:inline">Copiar enlace</span>
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}