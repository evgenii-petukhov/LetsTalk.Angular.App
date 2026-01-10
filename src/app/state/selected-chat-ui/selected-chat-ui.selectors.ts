import { createFeatureSelector, createSelector } from '@ngrx/store';
import { SelectedChatUiState } from 'src/app/models/selected-chat-ui-state';
import { selectSelectedChatId } from '../selected-chat/selected-chat-id.selectors';
import { selectVideoCall } from '../video-call/video-call.selectors';
import { MessageListStatus } from 'src/app/models/message-list-status';

export const selectSelectedChatUi =
    createFeatureSelector<SelectedChatUiState>('selectedChatUi');

export const selectSelectedChatMessageListStatus = createSelector(
    selectSelectedChatUi,
    (state) => state?.messageListStatus ?? MessageListStatus.Unknown,
);

export const selectSelectedChatIsCallInProgress = createSelector(
    selectVideoCall,
    selectSelectedChatId,
    (callState, chatId) => callState !== null && callState.chatId === chatId,
);

export const selectSelectedChatIsMessageListVisible = createSelector(
    selectSelectedChatIsCallInProgress,
    selectSelectedChatMessageListStatus,
    (isCallInProgress, status) =>
        !isCallInProgress &&
        [MessageListStatus.Unknown, MessageListStatus.Success].includes(status),
);

export const selectSelectedChatIsComposeAreaVisible = createSelector(
    selectSelectedChatIsCallInProgress,
    selectSelectedChatMessageListStatus,
    (isCallInProgress, status) =>
        !isCallInProgress && status === MessageListStatus.Success,
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
