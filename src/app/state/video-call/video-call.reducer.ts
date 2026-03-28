import { createReducer, on } from '@ngrx/store';
import { VideoCall } from '../../models/video-call';
import { videoCallActions } from './video-call.actions';

export const initialState: VideoCall | null = null;

export const videoCallReducer = createReducer(
    initialState,
    on(videoCallActions.initOutgoingCall, (_state, { chatId }) => ({
        chatId,
        status: 'outgoing',
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
            status: 'incoming-awaiting',
            captureVideo: true,
            captureAudio: true,
        }),
    ),
    on(videoCallActions.acceptIncomingCall, (state) => {
        if (!state) return state;
        return {
            ...state,
            status: 'incoming-active',
        };
    }),
    on(videoCallActions.setCallId, (state, { callId }) => ({
        ...state,
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
