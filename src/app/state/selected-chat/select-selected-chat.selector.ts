import { createSelector } from '@ngrx/store';
import { selectChats } from '../chats/chats.selector';
import { selectSelectedChatId } from './select-selected-chat-id.selectors';

export const selectSelectedChat = createSelector(
    selectChats,
    selectSelectedChatId,
    (chats, chatId) => chats?.find(chat => chat.id === chatId));
