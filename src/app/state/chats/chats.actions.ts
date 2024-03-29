import { createActionGroup, props } from '@ngrx/store';
import { IAccountDto } from 'src/app/api-client/api-client';

export const chatsActions = createActionGroup({
    source: 'Chats',
    events: {
        init: props<{chats: readonly IAccountDto[]}>(),
        setUnreadCount: props<{chatId: string; unreadCount: number}>(),
        incrementUnread: props<{chatId: string}>(),
        setLastMessageDate: props<{chatId: string; date: number}>(),
        setLastMessageId: props<{chatId: string; id: string}>(),
    }
});
