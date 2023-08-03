import { createActionGroup, props } from '@ngrx/store';
import { IImagePreviewDto, ILinkPreviewDto, IMessageDto } from 'src/app/api-client/api-client';

export const messagesActions = createActionGroup({
    source: 'Messages',
    events: {
        init: props<{ messageDtos: readonly IMessageDto[] }>(),
        addMessages: props<{ messageDtos: readonly IMessageDto[] }>(),
        addMessage: props<{ messageDto: IMessageDto }>(),
        setLinkPreview: props<{ linkPreviewDto: ILinkPreviewDto }>(),
        setImagePreview: props<{ imagePreviewDto: IImagePreviewDto }>()
    }
});
