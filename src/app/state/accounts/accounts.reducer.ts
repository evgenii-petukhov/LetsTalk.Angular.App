import { createReducer, on } from '@ngrx/store';
import { AccountDto, IAccountDto } from 'src/app/api-client/api-client';
import { AccountsActions } from './accounts.actions';

export const initialState: ReadonlyArray<IAccountDto> = [];

export const AccountsReducer = createReducer(
    initialState,
    on(AccountsActions.init, (_state, {accounts}) => accounts),
    on(AccountsActions.readall, (_state, {accountId}) => {
        return _state.map(state => state.id === accountId
            ? new AccountDto({...state, unreadCount: 0})
            : state);
    }),
    on(AccountsActions.incrementunread, (_state, {accountId}) => {
        return _state.map(state => state.id === accountId
            ? new AccountDto({...state, unreadCount: state.unreadCount + 1})
            : state);
    }),
    on(AccountsActions.setlastmessagedate, (_state, {accountId, date}) => {
        return _state.map(state => state.id === accountId
            ? new AccountDto({...state, lastMessageDate: new Date(date)})
            : state);
    })
);