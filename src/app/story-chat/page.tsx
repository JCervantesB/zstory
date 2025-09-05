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
        startGame,
        handleSubmit,
        setInput,
    } = useZombieGame(sessionIdParam || undefined);

    const [loading, setLoading] = useState(false);

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
                            <span className="font-medium">{currentGameSession.title}</span>
                            {currentGameSession.isCompleted && (
                                <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                                    Completada
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className='flex flex-col'>
                <div className='flex-1'>
                    <Conversation className='relative'>
                        <ConversationContent className='max-w-xl mx-auto'>
                            {messages.map(message => (
                                <GameMessage key={message.id} message={message} />
                            ))}
                            {isLoading && <GameLoader />}
                        </ConversationContent>
                        <ConversationScrollButton />
                    </Conversation>
                </div>
                <div className='max-w-2xl w-full mx-auto pb-4 flex-shrink-0'>
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