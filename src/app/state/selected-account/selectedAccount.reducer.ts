import { createReducer, on } from '@ngrx/store';
import { AccountDto } from '../../api-client/api-client';
import { SelectedAccountActions } from './selectedAccount.actions';

export const initialState: AccountDto = null;

export const selectedAccountReducer = createReducer(
    initialState,
    on(SelectedAccountActions.init, (_state, { account }) => account),
);