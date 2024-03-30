import { createReducer, on } from '@ngrx/store';
import { IProfileDto } from 'src/app/api-client/api-client';
import { loggedInUserActions } from './logged-in-user.actions';

export const initialState: IProfileDto = null;

export const loggedInUserReducer = createReducer(
    initialState,
    on(loggedInUserActions.init, (_state, { account }) => account),
    on(loggedInUserActions.set, (_state, { account }) => ({..._state, ...account})),
);
