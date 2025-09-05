import { Loader } from "./ai-elements/loader";
import { Message, MessageContent } from "./ai-elements/message";

export function GameLoader() {
    return (
        <Message from="user">
            <MessageContent>
                <div className="flex items-center gap-2">
                    <Loader />
                    Cargando historia...
                </div>
            </MessageContent>
        </Message>
    )
}