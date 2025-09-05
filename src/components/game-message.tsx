import { Message, MessageContent } from "./ai-elements/message";
import { type GameMessage as GameMessageType } from "@/lib/types";
import { Image as AIImage } from "./ai-elements/image";
import { Response } from "./ai-elements/response";
import { Loader } from "./ai-elements/loader";
import { UI_MESSAGES } from "@/lib/consts";
import Image from "next/image";

export function GameMessage({ message }: { message: GameMessageType }) {
    const { role, content, image, imageLoading, imageError } = message;

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
            </MessageContent>
        </Message>
    )
}
