import {
    PromptInput,
    PromptInputTextarea,
    PromptInputSubmit,
    PromptInputToolbar,
} from '@/components/ai-elements/prompt-input'
import { UI_MESSAGES } from '@/lib/consts';

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


    return (
        <PromptInput onSubmit={onSubmit}>
            <PromptInputTextarea 
                placeholder={disabled ? "Esta historia ha sido completada" : UI_MESSAGES.PLACEHOLDERS.INPUT} 
                value={input || ''} 
                onChange={onInputChange} 
                disabled={isLoading || disabled}
            />
            <PromptInputToolbar>
                <div></div>
                <PromptInputSubmit disabled={inputSubmitIsDisabled} />
            </PromptInputToolbar>
        </PromptInput>
    )
}