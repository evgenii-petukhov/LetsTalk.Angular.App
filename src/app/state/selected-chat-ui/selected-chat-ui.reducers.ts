import { createReducer, on } from '@ngrx/store';
import { SelectedChatUiState } from '../../models/selected-chat-ui-state';
import { selectedChatUiActions } from './selected-chat-ui.actions';

export const initialState: SelectedChatUiState | null = null;

export const selectedChatUiReducer = createReducer(
    initialState,
    on(
        selectedChatUiActions.setMessageListStatus,
        (state, { messageListStatus }) => ({
            ...state,
            messageListStatus,
        }),
    ),
);
