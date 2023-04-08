import { createReducer, on } from '@ngrx/store';
import { Message } from 'src/app/models/message';
import { MessagesActions } from './messages.actions';

export const initialState: ReadonlyArray<Message> = [];

export const MessagesReducer = createReducer(
    initialState,
    on(MessagesActions.init, (_state, {messages}) => messages),
    on(MessagesActions.add, (_state, {message}) => {
        const existing = _state.find(m => m.id === message.id);
        return [..._state.filter(m => m.id !== message.id), new Message({...existing, ...message})];
    })
);
