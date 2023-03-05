import { createReducer, on } from '@ngrx/store';
import { AccountDto } from 'src/app/api-client/api-client';
import { AccountsActions } from './accounts.actions';

export const initialState: ReadonlyArray<AccountDto> = [];

export const AccountsReducer = createReducer(
    initialState,
    on(AccountsActions.init, (_state, {accounts}) => accounts),
    on(AccountsActions.readall, (_state, {accountId}) => {
        return _state.map(state => state.id === accountId
            ? {...state, unreadCount: 0} as AccountDto
            : state);
    }),
    on(AccountsActions.increment, (_state, {accountId}) => {
        return _state.map(state => state.id === accountId
            ? {...state, unreadCount: state.unreadCount + 1} as AccountDto
            : state);
    })
);