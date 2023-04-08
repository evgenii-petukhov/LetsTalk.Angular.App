import { createReducer, on } from '@ngrx/store';
import { IAccountDto } from 'src/app/api-client/api-client';
import { loggedInUserActions } from './logged-in-user.actions';

export const initialState: IAccountDto = null;

export const loggedInUserReducer = createReducer(
    initialState,
    on(loggedInUserActions.init, (_state, { account }) => account),
);
