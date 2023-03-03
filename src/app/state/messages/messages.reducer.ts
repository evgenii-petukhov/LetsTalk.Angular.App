import { createReducer, on } from '@ngrx/store';
import { Message } from '../../models/rendering/message';
import { MessagesActions } from './messages.actions';

export const initialState: Array<Message> = [];

export const messagesReducer = createReducer(
    initialState,
    on(MessagesActions.init, (_state, {messages}) => messages),
    on(MessagesActions.add, (_state, {message}) => [..._state, message])
);