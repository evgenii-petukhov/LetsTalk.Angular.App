import { createReducer, on } from '@ngrx/store';
import { IAccountDto } from 'src/app/api-client/api-client';
import { LoggedInUserActions } from './logged-in-user.actions';

export const initialState: IAccountDto = null;

export const LoggedInUserReducer = createReducer(
    initialState,
    on(LoggedInUserActions.init, (_state, { account }) => account),
);