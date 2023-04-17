import { createActionGroup, props } from '@ngrx/store';
import { IMessageDto } from 'src/app/api-client/api-client';

export const messagesActions = createActionGroup({
    source: 'Messages',
    events: {
        init: props<{messageDtos: ReadonlyArray<IMessageDto>}>(),
        add: props<{messageDto: IMessageDto}>(),
        setLinkPreview: props<{messageDto: IMessageDto}>()
    }
});
