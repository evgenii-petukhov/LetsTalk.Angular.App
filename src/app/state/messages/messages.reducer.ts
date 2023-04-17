import { createReducer, on } from '@ngrx/store';
import { Message } from 'src/app/models/message';
import { messagesActions } from './messages.actions';

export const initialState: ReadonlyArray<Message> = [];

export const messagesReducer = createReducer(
    initialState,
    on(messagesActions.init, (_state, {messageDtos}) => messageDtos.map(messageDto => new Message(messageDto))),
    on(messagesActions.add, (_state, {messageDto}) => {
        const existing = _state.find(m => m.id === messageDto.id);
        return [..._state.filter(m => m.id !== messageDto.id), new Message(existing, messageDto)];
    }),
    on(messagesActions.setlinkpreview, (_state, {messageDto}) => {
        const existing = _state.find(m => m.id === messageDto.id);
        return existing?.linkPreview ? _state : [..._state.filter(m => m.id !== messageDto.id), new Message(existing, messageDto)];
    }),
);
