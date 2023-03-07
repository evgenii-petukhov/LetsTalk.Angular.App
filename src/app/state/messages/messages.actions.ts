import { createActionGroup, props } from "@ngrx/store";
import { IMessageDto } from "src/app/api-client/api-client";

export const MessagesActions = createActionGroup({
    source: 'Messages',
    events: {
        'init': props<{messages: ReadonlyArray<IMessageDto>}>(),
        'add': props<{message: IMessageDto}>(),
    }
});