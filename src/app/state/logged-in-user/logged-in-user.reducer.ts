import { createReducer, on } from '@ngrx/store';
import { AccountDto } from 'src/app/api-client/api-client';
import { LoggedInUserActions } from './logged-in-user.actions';

export const initialState: AccountDto = null;

export const LoggedInUserReducer = createReducer(
    initialState,
    on(LoggedInUserActions.init, (_state, { account }) => account),
);