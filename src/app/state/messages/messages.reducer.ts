import { createReducer, on } from '@ngrx/store';
import { Message } from 'src/app/models/message';
import { messagesActions } from './messages.actions';

export const initialState: readonly Message[] = [];

export const messagesReducer = createReducer(
    initialState,
    on(messagesActions.init, (_state, {messageDtos}) => messageDtos.map(messageDto => new Message(messageDto))),
    on(messagesActions.addMessage, (_state, {messageDto}) => {
        const existing = _state.find(m => m.id === messageDto.id);
        return (!!existing?.text || !!existing?.imageId) ? _state : [..._state.filter(m => m.id !== messageDto.id), new Message(existing, messageDto)];
    }),
    on(messagesActions.addMessages, (_state, {messageDtos}) => [...messageDtos.map(messageDto => new Message(messageDto)), ..._state]),
    on(messagesActions.setLinkPreview, (_state, {linkPreviewDto}) => {
        const existing = _state.find(m => m.id === linkPreviewDto.messageId);
        return existing?.linkPreview
            ? _state
            : [..._state.filter(m => m.id !== linkPreviewDto.messageId), new Message(existing, {linkPreview: linkPreviewDto})];
    }),
);
