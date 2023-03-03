import { createActionGroup, props } from "@ngrx/store";
import { Message } from "../models/rendering/message";

export const MessagesActions = createActionGroup({
    source: 'Messages',
    events: {
        'init': props<{messages: Message[]}>(),
        'add': props<{message: Message}>(),
    }
});