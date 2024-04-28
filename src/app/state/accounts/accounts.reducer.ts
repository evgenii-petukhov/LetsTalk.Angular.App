import { createReducer, on } from '@ngrx/store';
import { IChatDto } from 'src/app/api-client/api-client';
import { accountsActions } from './accounts.actions';

export const initialState: readonly IChatDto[] = null;

export const accountsReducer = createReducer(
    initialState,
    on(accountsActions.init, (_state, { accounts }) => accounts),
);
