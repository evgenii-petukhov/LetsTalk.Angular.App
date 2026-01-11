import { createActionGroup, props } from '@ngrx/store';
import { MessageListStatus } from '../../models/message-list-status';

export const selectedChatUiActions = createActionGroup({
    source: 'selectedChatUi',
    events: {
        setMessageListStatus: props<{ messageListStatus: MessageListStatus }>(),
    },
});
