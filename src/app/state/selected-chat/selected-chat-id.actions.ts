import { createActionGroup, props } from '@ngrx/store';

export const selectedChatIdActions = createActionGroup({
    source: 'SelectedChatId',
    events: {
        init: props<{ chatId: string }>(),
    },
});
