import { createReducer, on } from '@ngrx/store';
import { ChatDto, IChatDto } from 'src/app/api-client/api-client';
import { chatsActions } from './chats.actions';

export const initialState: readonly IChatDto[] = null;

export const chatsReducer = createReducer(
    initialState,
    on(chatsActions.init, (_state, { chats }) => chats),
    on(chatsActions.setUnreadCount, (_state, { chatId, unreadCount }) => _state.map(chat => chat.id === chatId
        ? new ChatDto({ ...chat, unreadCount: unreadCount })
        : chat)),
    on(chatsActions.incrementUnread, (_state, { chatId }) => _state.map(chat => chat.id === chatId
        ? new ChatDto({ ...chat, unreadCount: chat.unreadCount + 1 })
        : chat)),
    on(chatsActions.setLastMessageDate, (_state, { chatId, date }) => _state.map(chat => chat.id === chatId
        ? new ChatDto({ ...chat, lastMessageDate: date })
        : chat)),
    on(chatsActions.setLastMessageId, (_state, { chatId, id }) => _state.map(chat => chat.id === chatId
        ? new ChatDto({ ...chat, lastMessageId: id })
        : chat)),
    on(chatsActions.updateChatId, (_state, { chatId, newChatId }) => _state.map(chat => chat.id === chatId
        ? new ChatDto({ ...chat, id: newChatId })
        : chat)),
    on(chatsActions.add, (_state, { chatDto }) => [..._state, chatDto]),
);
