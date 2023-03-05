import { createReducer, on } from '@ngrx/store';
import { AccountDto } from 'src/app/api-client/api-client';
import { AccountsActions } from './accounts.actions';

export const initialState: ReadonlyArray<AccountDto> = [];

export const AccountsReducer = createReducer(
    initialState,
    on(AccountsActions.init, (_state, {accounts}) => accounts),
    on(AccountsActions.readall, (_state, {accountId}) => {
        return _state.map(state => {
            if (state.id === accountId) {
                const account = new AccountDto();
                account.id = state.id;
                account.firstName = state.firstName;
                account.lastName = state.lastName;
                account.accountTypeId = state.accountTypeId;
                account.photoUrl = state.photoUrl;
                account.unreadCount = 0;
                return account;
            } else {
                return state;
            }
        });
    }),
    on(AccountsActions.increment, (_state, {accountId}) => {
        return _state.map(state => {
            if (state.id === accountId) {
                const account = new AccountDto();
                account.id = state.id;
                account.firstName = state.firstName;
                account.lastName = state.lastName;
                account.accountTypeId = state.accountTypeId;
                account.photoUrl = state.photoUrl;
                account.unreadCount = state.unreadCount + 1;
                return account;
            } else {
                return state;
            }
        });
    })
);