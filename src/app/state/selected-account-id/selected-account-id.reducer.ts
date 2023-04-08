import { createReducer, on } from '@ngrx/store';
import { SelectedAccountIdActions } from './selected-account-id.actions';

export const initialState: number = null;

export const SelectedAccountIdReducer = createReducer(
    initialState,
    on(SelectedAccountIdActions.init, (_state, { accountId }) => accountId),
);
