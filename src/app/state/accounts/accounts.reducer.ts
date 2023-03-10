import { createReducer, on } from '@ngrx/store';
import { IAccountDto } from 'src/app/api-client/api-client';
import { AccountsActions } from './accounts.actions';

export const initialState: ReadonlyArray<IAccountDto> = [];

export const AccountsReducer = createReducer(
    initialState,
    on(AccountsActions.init, (_state, {accounts}) => accounts),
    on(AccountsActions.readall, (_state, {accountId}) => {
        return _state.map(state => state.id === accountId
            ? {...state, unreadCount: 0} as IAccountDto
            : state);
    }),
    on(AccountsActions.incrementunread, (_state, {accountId}) => {
        return _state.map(state => state.id === accountId
            ? {...state, unreadCount: state.unreadCount + 1} as IAccountDto
            : state);
    }),
    on(AccountsActions.setlastmessagedate, (_state, {accountId, date}) => {
        return _state.map(state => state.id === accountId
            ? {...state, lastMessageDate: date} as IAccountDto
            : state);
    })
);