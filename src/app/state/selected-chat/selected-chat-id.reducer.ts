import { createReducer, on } from '@ngrx/store';
import { selectedChatIdActions } from './selected-chat-id.actions';

export const initialState: string = null;

export const selectedChatIdReducer = createReducer(
    initialState,
    on(selectedChatIdActions.init, (_state, { chatId }) => chatId),
);
