import { createActionGroup, props } from "@ngrx/store";
import { Message } from "src/app/models/message";

export const MessagesActions = createActionGroup({
    source: 'Messages',
    events: {
        'init': props<{messages: ReadonlyArray<Message>}>(),
        'add': props<{message: Message}>(),
    }
});