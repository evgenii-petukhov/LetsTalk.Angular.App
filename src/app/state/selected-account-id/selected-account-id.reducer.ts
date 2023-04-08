import { createReducer, on } from '@ngrx/store';
import { selectedAccountIdActions } from './selected-account-id.actions';

export const initialState: number = null;

export const selectedAccountIdReducer = createReducer(
    initialState,
    on(selectedAccountIdActions.init, (_state, { accountId }) => accountId),
);
