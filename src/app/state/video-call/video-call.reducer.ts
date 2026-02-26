import { createReducer, on } from '@ngrx/store';
import { VideoCallState } from '../../models/video-call-state';
import { videoCallActions } from './video-call.actions';

export const initialState: VideoCallState | null = null;

export const videoCallReducer = createReducer(
    initialState,
    on(videoCallActions.initOutgoingCall, (_state, { chatId }) => ({
        chatId,
        type: 'outgoing',
        captureVideo: true,
        captureAudio: true,
    })),
    on(
        videoCallActions.initIncomingCall,
        (_state, { callId, chatId, offer, caller }) => ({
            callId,
            chatId,
            offer,
            caller,
            type: 'incoming-awaiting',
            captureVideo: true,
            captureAudio: true,
        }),
    ),
    on(videoCallActions.acceptIncomingCall, (state) => {
        if (!state) return state;
        return {
            ...state,
            type: 'incoming-active',
        };
    }),
    on(videoCallActions.setCallId, (_state, { callId }) => ({
        ..._state,
        callId,
    })),
    on(videoCallActions.toggleVideo, (state) => {
        if (!state) return state;
        return {
            ...state,
            captureVideo: !state.captureVideo,
        };
    }),
    on(videoCallActions.toggleAudio, (state) => {
        if (!state) return state;
        return {
            ...state,
            captureAudio: !state.captureAudio,
        };
    }),
    on(videoCallActions.reset, () => null),
);
