import { createReducer, on } from '@ngrx/store';
import { AccountDto, IAccountDto } from 'src/app/api-client/api-client';
import { AccountsActions } from './accounts.actions';

export const initialState: ReadonlyArray<IAccountDto> = [];

export const AccountsReducer = createReducer(
    initialState,
    on(AccountsActions.init, (_state, {accounts}) => accounts.map(account => {
        return account.lastMessageDate
            ? account
            : new AccountDto({...account, lastMessageDate: new Date(-8640000000000000)});
    })),
    on(AccountsActions.readall, (_state, {accountId}) => {
        return _state.map(account => account.id === accountId
            ? new AccountDto({...account, unreadCount: 0})
            : account);
    }),
    on(AccountsActions.incrementunread, (_state, {accountId}) => {
        return _state.map(account => account.id === accountId
            ? new AccountDto({...account, unreadCount: account.unreadCount + 1})
            : account);
    }),
    on(AccountsActions.setlastmessagedate, (_state, {accountId, date}) => {
        return _state.map(account => account.id === accountId
            ? new AccountDto({...account, lastMessageDate: new Date(date)})
            : account);
    })
);