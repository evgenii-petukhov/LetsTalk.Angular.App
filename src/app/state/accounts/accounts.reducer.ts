import { createReducer, on } from '@ngrx/store';
import { AccountDto, IAccountDto } from 'src/app/api-client/api-client';
import { accountsActions } from './accounts.actions';

export const initialState: readonly IAccountDto[] = null;

export const accountsReducer = createReducer(
    initialState,
    on(accountsActions.init, (_state, {accounts}) => accounts),
    on(accountsActions.readall, (_state, {accountId}) => _state.map(account => account.id === accountId
            ? new AccountDto({...account, unreadCount: 0})
            : account)),
    on(accountsActions.incrementunread, (_state, {accountId}) => _state.map(account => account.id === accountId
            ? new AccountDto({...account, unreadCount: account.unreadCount + 1})
            : account)),
    on(accountsActions.setlastmessagedate, (_state, {accountId, date}) => _state.map(account => account.id === accountId
            ? new AccountDto({...account, lastMessageDate: date})
            : account))
);
