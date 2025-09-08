import { Message, MessageContent } from "./ai-elements/message";
import { type GameMessage as GameMessageType } from "@/lib/types";
import { Image as AIImage } from "./ai-elements/image";
import { Response } from "./ai-elements/response";
import { Loader } from "./ai-elements/loader";
import { UI_MESSAGES } from "@/lib/consts";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";

interface GameMessageProps {
    message: GameMessageType;
    onDeleteScene?: (sceneId: string) => Promise<boolean>;
}

export function GameMessage({ message, onDeleteScene }: GameMessageProps) {
    const { role, content, image, imageLoading, imageError, sceneId } = message;
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (!sceneId || !onDeleteScene) return;
        
        setIsDeleting(true);
        try {
            const success = await onDeleteScene(sceneId);
            if (success) {
                toast.success('Escena eliminada correctamente');
            } else {
                toast.error('Error al eliminar la escena');
            }
        } catch {
            toast.error('Error al eliminar la escena');
        } finally {
            setIsDeleting(false);
        }
    };



    return (
        <Message from={role}>
            <MessageContent>
                {role === 'assistant' && (
                    <picture className="w-full max-w-2xl aspect-video overflow-hidden rounded-md relative">
                        {
                            imageLoading && (
                                <div className="w-full h-full flex justify-center items-center bg-black">
                                    <div className="flex items-center mb-4 space-x-2">
                                        <Loader />
                                        <span>{UI_MESSAGES.LOADING.IMAGE}</span>
                                    </div>
                                </div>
                            )
                        }

                        {image && !imageLoading && !imageError && (
                            typeof image === 'string' ? (
                                // Handle URL string
                                <Image
                                    src={image}
                                    alt="zombie apocalypse pixel art image"
                                    className="w-full h-full object-cover object-center"
                                    fill
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                />
                            ) : (
                                // Handle GeneratedImage object
                                <AIImage
                                    base64={image.base64Data}
                                    mediaType={image.mediaType}
                                    uint8Array={new Uint8Array()}
                                    alt="zombie apocalypse pixel art image"
                                    className="w-full h-full object-cover object-center"
                                />
                            )
                        )}

                        {imageError && !imageLoading && (
                            <div className="w-full h-full flex flex-col justify-center items-center bg-red-900/20 border border-red-500/30 rounded-md p-4">
                                <div className="text-red-400 text-sm text-center">
                                    <p className="font-semibold mb-2">Error al cargar la imagen <span className="text-xs opacity-70">(posiblemente contenido censurado, la escena se eliminara automáticamente)</span></p>
                                    <p className="text-xs opacity-80">{imageError}</p>
                                </div>
                            </div>
                        )}
                    </picture>
                )}
                <Response>
                    {content}
                </Response>
                {role === 'assistant' && sceneId && onDeleteScene && (
                    <div className="flex gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {/* Botón de regenerar temporalmente oculto - falta contexto para regeneración */}
                        {/* {onRegenerateScene && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleRegenerate}
                                disabled={isRegenerating || isDeleting}
                                className="text-xs"
                            >
                                <RotateCcw className="w-3 h-3 mr-1" />
                                {isRegenerating ? 'Regenerando...' : 'Regenerar'}
                            </Button>
                        )} */}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                            <Trash2 className="w-3 h-3 mr-1" />
                            {isDeleting ? 'Eliminando...' : 'Eliminar'}
                        </Button>
                    </div>
                )}
            </MessageContent>
        </Message>
    )
}
