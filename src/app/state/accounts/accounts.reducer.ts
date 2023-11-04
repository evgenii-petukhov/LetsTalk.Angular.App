import { createReducer, on } from '@ngrx/store';
import { AccountDto, IAccountDto } from 'src/app/api-client/api-client';
import { accountsActions } from './accounts.actions';

export const initialState: readonly IAccountDto[] = null;

export const accountsReducer = createReducer(
    initialState,
    on(accountsActions.init, (_state, { accounts }) => accounts),
    on(accountsActions.setUnreadCount, (_state, { accountId, unreadCount }) => _state.map(account => account.id === accountId
        ? new AccountDto({ ...account, unreadCount: unreadCount })
        : account)),
    on(accountsActions.incrementUnread, (_state, { accountId }) => _state.map(account => account.id === accountId
        ? new AccountDto({ ...account, unreadCount: account.unreadCount + 1 })
        : account)),
    on(accountsActions.setLastMessageDate, (_state, { accountId, date }) => _state.map(account => account.id === accountId
        ? new AccountDto({ ...account, lastMessageDate: date })
        : account)),
    on(accountsActions.setLastMessageId, (_state, { accountId, id }) => _state.map(account => account.id === accountId
        ? new AccountDto({ ...account, lastMessageId: id })
        : account)),
);
