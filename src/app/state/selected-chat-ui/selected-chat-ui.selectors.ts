import { createFeatureSelector, createSelector } from '@ngrx/store';
import { SelectedChatUiState } from '../../models/selected-chat-ui-state';
import { selectSelectedChatId } from '../selected-chat/selected-chat-id.selectors';
import { selectVideoCall } from '../video-call/video-call.selectors';
import { MessageListStatus } from '../../models/message-list-status';

export const selectSelectedChatUi =
    createFeatureSelector<SelectedChatUiState>('selectedChatUi');

export const selectMessageListStatus = createSelector(
    selectSelectedChatUi,
    (state) => state?.messageListStatus ?? MessageListStatus.Unknown,
);

export const selectIsCallInProgress = createSelector(
    selectVideoCall,
    selectSelectedChatId,
    (state, chatId) =>
        state !== null &&
        state.chatId === chatId &&
        state.type !== 'incoming-awaiting',
);

export const selectIsOngoingCallVisible = createSelector(
    selectVideoCall,
    selectSelectedChatId,
    (state, chatId) =>
        state !== null &&
        state.chatId !== chatId,
);

export const selectIsAwaitingResponse = createSelector(
    selectVideoCall,
    selectSelectedChatId,
    (state, chatId) =>
        state !== null &&
        state.chatId === chatId &&
        state.type === 'incoming-awaiting',
);

export const selectIsHeaderVisible = createSelector(
    selectIsCallInProgress,
    selectIsAwaitingResponse,
    (isCallInProgress, awaitingResponse) =>
        !isCallInProgress && !awaitingResponse,
);

export const selectIsMessageListVisible = createSelector(
    selectIsCallInProgress,
    selectIsAwaitingResponse,
    selectMessageListStatus,
    (isCallInProgress, awaitingResponse, status) =>
        !isCallInProgress &&
        !awaitingResponse &&
        [MessageListStatus.Unknown, MessageListStatus.Success].includes(status),
);

export const selectIsComposeAreaVisible = createSelector(
    selectIsCallInProgress,
    selectIsAwaitingResponse,
    selectMessageListStatus,
    (isCallInProgress, awaitingResponse, status) =>
        !isCallInProgress &&
        !awaitingResponse &&
        status === MessageListStatus.Success,
);

export const selectIsNotFoundVisible = createSelector(
    selectIsCallInProgress,
    selectMessageListStatus,
    (isCallInProgress, status) =>
        !isCallInProgress && status === MessageListStatus.NotFound,
);

export const selectIsErrorVisible = createSelector(
    selectIsCallInProgress,
    selectMessageListStatus,
    (isCallInProgress, status) =>
        !isCallInProgress && status === MessageListStatus.Error,
);
