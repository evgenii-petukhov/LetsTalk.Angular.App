import { createActionGroup, props } from '@ngrx/store';
import { IAccountDto } from 'src/app/api-client/api-client';

export const accountsActions = createActionGroup({
    source: 'Accounts',
    events: {
        init: props<{accounts: readonly IAccountDto[]}>(),
        setUnreadCount: props<{accountId: string; unreadCount: number}>(),
        incrementUnread: props<{accountId: string}>(),
        setLastMessageDate: props<{accountId: string; date: number}>(),
        setLastMessageId: props<{accountId: string; id: string}>(),
    }
});
