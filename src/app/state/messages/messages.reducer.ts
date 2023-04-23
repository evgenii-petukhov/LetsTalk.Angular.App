import { createReducer, on } from '@ngrx/store';
import { Message } from 'src/app/models/message';
import { messagesActions } from './messages.actions';

export const initialState: readonly Message[] = [];

export const messagesReducer = createReducer(
    initialState,
    on(messagesActions.init, (_state, {messageDtos}) => messageDtos.map(messageDto => new Message(messageDto))),
    on(messagesActions.add, (_state, {messageDto}) => {
        const existing = _state.find(m => m.id === messageDto.id);
        return existing?.text ? _state : [..._state.filter(m => m.id !== messageDto.id), new Message(existing, messageDto)];
    }),
    on(messagesActions.setlinkpreview, (_state, {linkPreviewDto}) => {
        const existing = _state.find(m => m.id === linkPreviewDto.messageId);
        return existing?.linkPreview
            ? _state
            : [..._state.filter(m => m.id !== linkPreviewDto.messageId), new Message(existing, {linkPreview: linkPreviewDto})];
    }),
);
