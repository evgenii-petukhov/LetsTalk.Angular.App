import { createReducer, on } from '@ngrx/store';
import { IMessageDto, MessageDto } from 'src/app/api-client/api-client';
import { MessagesActions } from './messages.actions';

export const initialState: ReadonlyArray<IMessageDto> = [];

export const MessagesReducer = createReducer(
    initialState,
    on(MessagesActions.init, (_state, {messages}) => messages),
    on(MessagesActions.add, (_state, {message}) => [..._state, new MessageDto(message)])
);