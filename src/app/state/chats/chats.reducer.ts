import { createReducer, on } from '@ngrx/store';
import { AccountDto, IAccountDto } from 'src/app/api-client/api-client';
import { chatsActions } from './chats.actions';

export const initialState: readonly IAccountDto[] = null;

export const chatsReducer = createReducer(
    initialState,
    on(chatsActions.init, (_state, { chats }) => chats),
    on(chatsActions.setUnreadCount, (_state, { chatId, unreadCount }) => _state.map(chat => chat.id === chatId
        ? new AccountDto({ ...chat, unreadCount: unreadCount })
        : chat)),
    on(chatsActions.incrementUnread, (_state, { chatId }) => _state.map(chat => chat.id === chatId
        ? new AccountDto({ ...chat, unreadCount: chat.unreadCount + 1 })
        : chat)),
    on(chatsActions.setLastMessageDate, (_state, { chatId, date }) => _state.map(chat => chat.id === chatId
        ? new AccountDto({ ...chat, lastMessageDate: date })
        : chat)),
    on(chatsActions.setLastMessageId, (_state, { chatId, id }) => _state.map(chat => chat.id === chatId
        ? new AccountDto({ ...chat, lastMessageId: id })
        : chat)),
);
