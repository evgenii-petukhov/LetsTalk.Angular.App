import { createReducer, on } from '@ngrx/store';
import { Message } from 'src/app/models/message';
import { messagesActions } from './messages.actions';

export const initialState: readonly Message[] = [];

export const messagesReducer = createReducer(
    initialState,
    on(messagesActions.init, (_state, { messageDtos }) =>
        messageDtos.map((messageDto) => new Message(messageDto)),
    ),
    on(messagesActions.addMessage, (_state, { messageDto }) => {
        const existing = _state.find((m) => m.id === messageDto.id);
        return !!existing?.text || !!existing?.image
            ? _state
            : [
                  ..._state.filter((m) => m.id !== messageDto.id),
                  new Message(existing, messageDto),
              ];
    }),
    on(messagesActions.addMessages, (_state, { messageDtos }) => {
        const messages = messageDtos
            .map((messageDto) => new Message(messageDto))
            .filter(
                (message) => !_state.some((prev) => prev.id === message.id),
            );
        return [..._state, ...messages];
    }),
    on(messagesActions.setLinkPreview, (_state, { linkPreviewDto }) => {
        const existing = _state.find((m) => m.id === linkPreviewDto.messageId);
        return existing?.linkPreview
            ? _state
            : [
                  ..._state.filter((m) => m.id !== linkPreviewDto.messageId),
                  new Message(existing, { linkPreview: linkPreviewDto }),
              ];
    }),
    on(messagesActions.setImagePreview, (_state, { imagePreviewDto }) => {
        const existing = _state.find((m) => m.id === imagePreviewDto.messageId);
        return existing?.imagePreview
            ? _state
            : [
                  ..._state.filter((m) => m.id !== imagePreviewDto.messageId),
                  new Message(existing, { imagePreview: imagePreviewDto }),
              ];
    }),
);
