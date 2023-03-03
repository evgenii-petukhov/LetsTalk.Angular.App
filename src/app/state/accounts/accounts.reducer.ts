import { createReducer, on } from '@ngrx/store';
import { AccountDto } from 'src/app/api-client/api-client';
import { AccountsActions } from './accounts.actions';

export const initialState: Array<AccountDto> = [];

export const accountsReducer = createReducer(
    initialState,
    on(AccountsActions.init, (_state, {accounts}) => accounts)
);