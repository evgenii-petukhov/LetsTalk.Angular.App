import { createActionGroup, props } from '@ngrx/store';
import { ILinkPreviewDto, IMessageDto } from 'src/app/api-client/api-client';

export const messagesActions = createActionGroup({
    source: 'Messages',
    events: {
        init: props<{messageDtos: readonly IMessageDto[]}>(),
        add: props<{messageDto: IMessageDto}>(),
        setLinkPreview: props<{linkPreviewDto: ILinkPreviewDto}>()
    }
});
