import {
    PromptInput,
    PromptInputTextarea,
    PromptInputSubmit,
    PromptInputToolbar,
} from '@/components/ai-elements/prompt-input'
import { UI_MESSAGES } from '@/lib/consts';
import { Button } from '@/components/ui/button';
import { ArrowUpIcon } from 'lucide-react';
import { useCallback, useRef, useEffect } from 'react';

interface GameInputProps {
    input: string;
    onInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    isLoading: boolean;
    disabled?: boolean;
}

export function GameInput({ input, onInputChange, onSubmit, isLoading, disabled = false }: GameInputProps) {
    const inputTrimmed = (input || '').trim();
    const inputSubmitIsDisabled = isLoading || inputTrimmed === '' || disabled;
    const topRef = useRef<HTMLElement | null>(null);

    // Buscar elemento para scroll al inicio
    useEffect(() => {
        const titleElement = document.querySelector('h1, h2, .title, [data-title]') as HTMLElement;
        const firstMessage = document.querySelector('[data-testid="game-message"], .game-message, [role="log"] > div > *:first-child') as HTMLElement;
        topRef.current = titleElement || firstMessage || document.querySelector('[role="log"]') as HTMLElement;
    }, []);

    const handleScrollToTop = useCallback(() => {
        if (topRef.current) {
            topRef.current.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start',
                inline: 'nearest'
            });
        } else {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
    }, []);

    return (
        <div data-testid="game-input" className="game-input">
            {/* Botón de scroll hacia arriba */}
            <Button
                className="fixed top-20 right-4 rounded-full z-50 shadow-lg"
                onClick={handleScrollToTop}
                size="icon"
                type="button"
                variant="outline"
            >
                <ArrowUpIcon className="size-4" />
            </Button>
            
            <PromptInput onSubmit={onSubmit}>
                <PromptInputTextarea 
                    placeholder={disabled ? "Esta historia ha sido completada" : UI_MESSAGES.PLACEHOLDERS.INPUT} 
                    value={input || ''} 
                    onChange={onInputChange} 
                    disabled={isLoading || disabled}
                    data-testid="prompt-input"
                />
                <PromptInputToolbar>
                    <div></div>
                    <PromptInputSubmit disabled={inputSubmitIsDisabled} />
                </PromptInputToolbar>
            </PromptInput>
        </div>
    )
}