import { createReducer, on } from '@ngrx/store';
import { Message } from 'src/app/models/message';
import { messagesActions } from './messages.actions';

export const initialState: ReadonlyArray<Message> = [];

export const messagesReducer = createReducer(
    initialState,
    on(messagesActions.init, (_state, {messages}) => messages),
    on(messagesActions.add, (_state, {message}) => {
        const existing = _state.find(m => m.id === message.id);
        return [..._state.filter(m => m.id !== message.id), new Message(existing, message)];
    })
);
