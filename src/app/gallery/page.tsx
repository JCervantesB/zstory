'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { NavigationHeader } from '@/components/ui/navigation-header';
import { Clock, BookOpen, ChevronLeft, ChevronRight, Skull } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface PublicStory {
  id: string;
  title: string;
  createdAt: string;
  lastActive: string;
  userName: string;
  characterFullName: string;
  characterImageUrl: string | null;
  sceneCount: number;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export default function GalleryPage() {
  const [stories, setStories] = useState<PublicStory[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStories = async (page: number = 1) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/public-stories?page=${page}&limit=12`);
      
      if (!response.ok) {
        throw new Error('Error al cargar las historias');
      }

      const data = await response.json();
      setStories(data.stories);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStories();
  }, []);

  const handlePageChange = (newPage: number) => {
    fetchStories(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-green-900 to-gray-900 p-2 sm:p-4 lg:p-6" style={{
        backgroundImage: `
          radial-gradient(circle at 20% 50%, rgba(34, 197, 94, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(239, 68, 68, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 40% 80%, rgba(34, 197, 94, 0.05) 0%, transparent 50%)
        `
      }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-6 sm:py-8 lg:py-12">
            <div className="mx-auto animate-pulse">
              <Image
                src="/01.png"
                alt="Zombie Story Loading"
                width={100}
                height={100}
                className="h-28 w-28 sm:h-40 sm:w-40 lg:h-48 lg:w-48 mx-auto"
              />
            </div>
            <p className="text-secondary mt-2 sm:mt-4 font-mono text-sm sm:text-base lg:text-lg pixel-text px-2">CARGANDO HISTORIAS DE SUPERVIVENCIA...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-green-900 to-gray-900 p-2 sm:p-4 lg:p-6" style={{
        backgroundImage: `
          radial-gradient(circle at 20% 50%, rgba(34, 197, 94, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(239, 68, 68, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 40% 80%, rgba(34, 197, 94, 0.05) 0%, transparent 50%)
        `
      }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-6 sm:py-8 lg:py-12 px-2">
            <Skull className="h-12 w-12 sm:h-14 sm:w-14 lg:h-16 lg:w-16 text-red-400 mx-auto mb-3 sm:mb-4" />
            <p className="text-destructive text-sm sm:text-base lg:text-lg font-mono pixel-text px-2">{error}</p>
            <Button 
              onClick={() => fetchStories()} 
              className="mt-3 sm:mt-4 bg-red-600 hover:bg-red-700 border-2 border-red-400 font-mono pixel-button text-sm sm:text-base px-4 py-2 sm:px-6 sm:py-3"
              variant="outline"
            >
              🧟 REINTENTAR
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-red-900 to-black text-foreground font-mono">
      {/* Navigation Header */}
      <NavigationHeader 
        title="GALERÍA ZOMBIE"
        subtitle="Historias de Supervivencia Compartidas"
      />
      
      <div className="max-w-7xl mx-auto p-2 sm:p-4 lg:p-6">
        {/* Stats Header */}
        <div className="text-center py-4 sm:py-6 lg:py-8 px-2">
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto font-mono pixel-text px-2 mb-4">
            HISTORIAS DE SUPERVIVENCIA COMPARTIDAS POR LA COMUNIDAD
          </p>
          <div className="px-2">
            <Badge variant="secondary" className="text-xs sm:text-sm md:text-base lg:text-lg px-2 py-1 sm:px-3 sm:py-2 md:px-4 md:py-2 lg:px-6 lg:py-3 bg-green-800 border-2 border-green-400 text-green-100 font-mono pixel-button max-w-full break-words text-center inline-block">
              💀 {pagination.totalCount} HISTORIAS DE SUPERVIVIENTES 💀
            </Badge>
          </div>
        </div>

        {/* Stories Grid */}
        {stories.length === 0 ? (
          <div className="text-center py-8 sm:py-10 lg:py-12 px-2">
            <Skull className="h-12 w-12 sm:h-14 sm:w-14 lg:h-16 lg:w-16 text-red-400 mx-auto mb-3 sm:mb-4 animate-bounce" />
            <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-secondary mb-2 font-mono pixel-text px-2">
              💀 NO HAY SUPERVIVIENTES AÚN 💀
            </h3>
            <p className="text-sm sm:text-base lg:text-lg text-muted-foreground font-mono pixel-text px-2">
              🧟 ¡SÉ EL PRIMERO EN COMPARTIR TU HISTORIA DE SUPERVIVENCIA! 🧟
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8 px-2 sm:px-0">
            {stories.map((story) => (
              <Link key={story.id} href={`/story/${story.id}`}>
                <Card className="bg-black/80 border-2 border-green-600/50 hover:border-green-400 hover:shadow-lg hover:shadow-green-400/20 transition-all duration-300 hover:scale-105 cursor-pointer h-full pixel-border">
                  <CardHeader className="pb-2 sm:pb-3 bg-gradient-to-r from-green-900/30 to-red-900/30 p-3 sm:p-4 lg:p-6">
                    <div className="flex items-center space-x-2 sm:space-x-3 mb-2 sm:mb-3">
                      <Avatar className="h-8 w-8 sm:h-9 sm:w-9 lg:h-10 lg:w-10 border-2 border-green-400 flex-shrink-0">
                        <AvatarImage 
                          src={story.characterImageUrl || undefined} 
                          alt={story.characterFullName}
                        />
                        <AvatarFallback className="bg-green-700 text-green-100 font-mono text-xs sm:text-sm">
                          {story.characterFullName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-green-300 truncate font-mono">
                          🧟 {story.characterFullName}
                        </p>
                        <p className="text-xs text-green-400 truncate font-mono">
                          👤 {story.userName}
                        </p>
                      </div>
                    </div>
                    <CardTitle className="text-green-100 text-sm sm:text-base lg:text-lg line-clamp-2 font-mono pixel-text leading-tight">
                      📖 {story.title || 'Historia sin título'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="bg-black/60 p-3 sm:p-4 lg:p-6">
                    <div className="space-y-2 sm:space-y-3">
                      <div className="flex items-center justify-between text-xs sm:text-sm text-green-300 font-mono gap-2">
                        <div className="flex items-center space-x-1">
                          <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 text-green-400 flex-shrink-0" />
                          <span className='text-white'>{story.sceneCount}</span>
                        </div>
                        <div className="flex items-center space-x-1 min-w-0 flex-1">
                          <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-green-400 flex-shrink-0" />
                          <span className="text-xs truncate max-w-16 sm:max-w-24 md:max-w-none">
                            Activo {formatDistanceToNow(new Date(story.lastActive), {
                              addSuffix: false,
                              locale: es,
                            })}
                          </span>
                        </div>
                      </div>
                      <Badge variant="outline" className="w-full justify-center bg-green-800 border-green-400 text-green-100 hover:bg-green-700 font-mono pixel-button text-xs sm:text-sm py-1 sm:py-2">
                        🧟 LEER HISTORIA 🧟
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-3 sm:space-y-0 sm:space-x-3 lg:space-x-4 py-6 sm:py-8 px-2">
            <Button
              variant="outline"
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={!pagination.hasPreviousPage}
              className="flex items-center space-x-1 sm:space-x-2 bg-green-800 border-2 border-green-400 text-green-100 hover:bg-green-700 font-mono pixel-button disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm px-3 py-2 sm:px-4 sm:py-2 w-full sm:w-auto"
            >
              <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>⬅️ ANTERIOR</span>
            </Button>
            
            <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto max-w-full scrollbar-hide px-2">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                .filter(page => {
                  const current = pagination.currentPage;
                  return page === 1 || page === pagination.totalPages || 
                         (page >= current - 1 && page <= current + 1);
                })
                .map((page, index, array) => {
                  const showEllipsis = index > 0 && array[index - 1] !== page - 1;
                  return (
                    <div key={page} className="flex items-center space-x-1 sm:space-x-2">
                      {showEllipsis && <span className="text-green-400 font-mono text-xs sm:text-sm">💀</span>}
                      <Button
                        variant={page === pagination.currentPage ? "default" : "outline"}
                        onClick={() => handlePageChange(page)}
                        className={`w-8 h-8 sm:w-10 sm:h-10 p-0 font-mono pixel-button border-2 text-xs sm:text-sm flex-shrink-0 ${
                          page === pagination.currentPage 
                            ? 'bg-red-600 border-red-400 text-white hover:bg-red-700' 
                            : 'bg-green-800 border-green-400 text-green-100 hover:bg-green-700'
                        }`}
                      >
                        {page}
                      </Button>
                    </div>
                  );
                })}
            </div>

            <Button
              variant="outline"
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={!pagination.hasNextPage}
              className="flex items-center space-x-1 sm:space-x-2 bg-green-800 border-2 border-green-400 text-green-100 hover:bg-green-700 font-mono pixel-button disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm px-3 py-2 sm:px-4 sm:py-2 w-full sm:w-auto"
            >
              <span>SIGUIENTE ➡️</span>
              <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}