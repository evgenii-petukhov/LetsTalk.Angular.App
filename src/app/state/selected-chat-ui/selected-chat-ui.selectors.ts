import { createFeatureSelector, createSelector } from '@ngrx/store';
import { SelectedChatUiState } from '../../models/selected-chat-ui-state';
import { selectSelectedChatId } from '../selected-chat/selected-chat-id.selectors';
import { selectVideoCall } from '../video-call/video-call.selectors';
import { MessageListStatus } from '../../models/message-list-status';

export const selectSelectedChatUi =
    createFeatureSelector<SelectedChatUiState>('selectedChatUi');

export const selectSelectedChatMessageListStatus = createSelector(
    selectSelectedChatUi,
    (state) => state?.messageListStatus ?? MessageListStatus.Unknown,
);

export const selectSelectedChatIsCallInProgress = createSelector(
    selectVideoCall,
    selectSelectedChatId,
    (state, chatId) =>
        state !== null &&
        state.chatId === chatId &&
        state.type !== 'incoming-awaiting',
);

export const selectSelectedChatIsAwaitingResponse = createSelector(
    selectVideoCall,
    (state) => state !== null && state.type === 'incoming-awaiting',
);

export const selectSelectedChatIsMessageListVisible = createSelector(
    selectSelectedChatIsCallInProgress,
    selectSelectedChatIsAwaitingResponse,
    selectSelectedChatMessageListStatus,
    (isCallInProgress, awaitingResponse, status) =>
        !isCallInProgress &&
        !awaitingResponse &&
        [MessageListStatus.Unknown, MessageListStatus.Success].includes(status),
);

export const selectSelectedChatIsComposeAreaVisible = createSelector(
    selectSelectedChatIsCallInProgress,
    selectSelectedChatIsAwaitingResponse,
    selectSelectedChatMessageListStatus,
    (isCallInProgress, awaitingResponse, status) =>
        !isCallInProgress &&
        !awaitingResponse &&
        status === MessageListStatus.Success,
);

export const selectSelectedChatIsNotFoundVisible = createSelector(
    selectSelectedChatIsCallInProgress,
    selectSelectedChatMessageListStatus,
    (isCallInProgress, status) =>
        !isCallInProgress && status === MessageListStatus.NotFound,
);

export const selectSelectedChatIsErrorVisible = createSelector(
    selectSelectedChatIsCallInProgress,
    selectSelectedChatMessageListStatus,
    (isCallInProgress, status) =>
        !isCallInProgress && status === MessageListStatus.Error,
);
