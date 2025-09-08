'use client';
import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { useZombieGame } from '../hooks/use-zombie-game';
import { GameLoader } from '@/components/game-loader';
import { GameMessage } from '@/components/game-message';
import { GameInput } from '@/components/game-input';
import { Conversation, ConversationContent, ConversationScrollButton } from '@/components/ai-elements/conversation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'sonner';

function StoryChatContent() {
    const searchParams = useSearchParams();
    const sessionIdParam = searchParams.get('sessionId');
    const { data: session, isPending } = useSession();
    
    const {
        messages,
        input,
        isLoading,
        currentGameSession,
        setCurrentGameSession,
        startGame,
        handleSubmit,
        setInput,
        deleteScene,
        regenerateScene,
    } = useZombieGame(sessionIdParam || undefined);

    const [loading, setLoading] = useState(false);
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [editedTitle, setEditedTitle] = useState('');

    const handleCreateNewStory = async () => {
        setLoading(true);
        try {
            await startGame();
        } catch {
            toast.error('Error al crear nueva historia');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveTitle = async () => {
        if (!currentGameSession || !editedTitle.trim()) return;
        
        try {
            const response = await fetch(`/api/game-sessions/${currentGameSession.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ title: editedTitle.trim() }),
            });

            if (!response.ok) {
                throw new Error('Error al actualizar el título');
            }

            const data = await response.json();
            setCurrentGameSession(data.session);
            setIsEditingTitle(false);
            toast.success('Título actualizado correctamente');
        } catch (error) {
            console.error('Error updating title:', error);
            toast.error('Error al actualizar el título. Por favor, inténtalo de nuevo.');
            // Revertir el título editado al original
            setEditedTitle(currentGameSession.title || '');
        }
    };

    const handleCancelEdit = () => {
        setIsEditingTitle(false);
        setEditedTitle('');
    };

    const handleStartEdit = () => {
        if (currentGameSession) {
            setEditedTitle(currentGameSession.title || '');
            setIsEditingTitle(true);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSaveTitle();
        } else if (e.key === 'Escape') {
            handleCancelEdit();
        }
    };

    // El hook useZombieGame ya maneja la inicialización de sesiones
    // No necesitamos un useEffect adicional aquí

    // Redirigir a login si no está autenticado
    if (isPending) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <GameLoader />
            </div>
        );
    }

    if (!session) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Acceso Requerido</h1>
                    <p className="text-gray-600 mb-6">Necesitas iniciar sesión para acceder al juego.</p>
                    <Link href="/auth/sign-in">
                        <Button className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg">
                            Iniciar Sesión
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    // Si no hay sesión activa, mostrar pantalla de bienvenida
    if (!currentGameSession && !isLoading) {
        return (
            <div className='font-sans min-h-screen p-8 mx-auto relative'>
                {/* Botón flotante de navegación */}
                <div className="fixed top-4 left-4 z-50">
                    <Link href="/dashboard">
                        <Button
                            variant="outline"
                            size="sm"
                            className="border-gray-600 text-gray-300 hover:bg-gray-700 w-auto"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            <span className="hidden md:inline">Volver al menú</span>
                        </Button>
                    </Link>
                </div>

                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center max-w-lg px-6 py-8 bg-gray-900 rounded-xl shadow-lg border border-gray-700">
                        <h1 className="text-4xl font-bold text-white mb-6 leading-tight">
                            ¡Bienvenido a tu Aventura Zombie!
                        </h1>
                        <div className="mb-6">
                            <Image
                                src="/logo.png"
                                alt="Logo Zombie Story"
                                width={120}
                                height={120}
                                className="mx-auto"
                                priority
                            />
                        </div>
                        <p className="text-xl text-gray-300 mb-8 leading-relaxed font-medium">
                            No tienes una historia activa en este momento. ¿Estás listo para comenzar 
                            una nueva aventura de supervivencia?
                        </p>
                        <div className="space-y-4">
                            <Button 
                                onClick={handleCreateNewStory}
                                className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 rounded-lg w-full text-lg font-semibold shadow-md transition-all duration-200"
                                disabled={loading || isLoading}
                            >
                                {loading || isLoading ? 'Creando Historia...' : 'Crear Nueva Historia Ahora'}
                            </Button>
                            <Link href="/dashboard">
                                <Button 
                                    variant="outline"
                                    className="border-2 border-red-700 text-red-700 hover:bg-red-700 hover:text-white px-8 py-4 rounded-lg w-full text-lg font-semibold shadow-md transition-all duration-200"
                                >
                                    Ir al Menú Principal
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className='font-sans min-h-screen p-8 mx-auto relative'>
            {/* Botón flotante de navegación */}
            <div className="fixed top-4 left-4 z-50">
                <Link href="/dashboard">
                    <Button
                            variant="outline"
                            size="sm"
                            className="border-gray-600 text-gray-300 hover:bg-gray-700 w-auto"
                        >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        <span className="hidden md:inline">Volver al menú</span>
                    </Button>
                </Link>
            </div>

            {/* Header con información de sesión */}
            <div className="mb-6">
                <div className="flex items-center justify-center max-w-2xl mx-auto">
                    {currentGameSession && (
                        <div className="text-sm text-gray-600 text-center">
                            {isEditingTitle ? (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full max-w-md mx-auto">
                  <input
                    type="text"
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    onKeyDown={handleKeyPress}
                    onBlur={handleSaveTitle}
                    className="text-lg sm:text-xl font-bold text-primary bg-transparent border-b-2 border-primary focus:outline-none focus:border-primary/80 min-w-0 flex-1 px-2 py-1 text-center sm:text-left"
                    autoFocus
                    placeholder="Título de la historia"
                  />
                  <div className="flex justify-center sm:justify-start gap-2 mt-2 sm:mt-0">
                    <button
                      onClick={handleSaveTitle}
                      className="text-green-500 hover:text-green-400 text-sm px-3 py-2 rounded-md bg-green-500/10 hover:bg-green-500/20 transition-colors min-w-[60px] flex items-center justify-center"
                      title="Guardar (Enter)"
                    >
                      <span className="text-base">✓</span>
                      <span className="ml-1 hidden sm:inline text-xs">Guardar</span>
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="text-red-500 hover:text-red-400 text-sm px-3 py-2 rounded-md bg-red-500/10 hover:bg-red-500/20 transition-colors min-w-[60px] flex items-center justify-center"
                      title="Cancelar (Esc)"
                    >
                      <span className="text-base">✗</span>
                      <span className="ml-1 hidden sm:inline text-xs">Cancelar</span>
                    </button>
                  </div>
                </div>
              ) : (
                <span 
                  className="text-xl font-bold text-primary cursor-pointer hover:text-primary/80 transition-colors"
                  onClick={handleStartEdit}
                  title="Haz clic para editar el título"
                >
                  {currentGameSession.title}
                </span>
              )}
                            {currentGameSession.isCompleted && (
                                <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                                    Completada
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className='flex flex-col h-[calc(100vh-120px)] md:h-[calc(100vh-200px)] scrollbar-hide'>
                <div className='flex-1 overflow-hidden scrollbar-hide'>
                    <Conversation className='relative h-full'>
                        <ConversationContent className='max-w-xl md:max-w-3xl lg:max-w-4xl mx-auto'>
                            {messages.map(message => (
                                <GameMessage 
                                    key={message.id} 
                                    message={message}
                                    onDeleteScene={deleteScene}
                                />
                            ))}
                            {isLoading && <GameLoader />}
                        </ConversationContent>
                        <ConversationScrollButton />
                    </Conversation>
                </div>
                <div className='max-w-2xl md:max-w-3xl lg:max-w-4xl w-full mx-auto pb-4 flex-shrink-0'>
                    <GameInput
                        input={input}
                        onInputChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInput(e.target.value)}
                        onSubmit={handleSubmit}
                        isLoading={isLoading}
                        disabled={currentGameSession?.isCompleted}
                    />
                    {currentGameSession?.isCompleted && (
                        <div className="text-center mt-4">
                            <p className="text-gray-600 text-sm">
                                Esta historia ha sido completada. Puedes revisarla pero no continuar.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default function StoryChat() {
    return (
        <Suspense fallback={<GameLoader />}>
            <StoryChatContent />
        </Suspense>
    );
}