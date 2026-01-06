import { createReducer, on } from '@ngrx/store';
import { VideoCallState } from 'src/app/models/video-call-state';
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
    on(videoCallActions.initIncomingCall, (_state, { chatId, offer }) => ({
        chatId,
        offer,
        type: 'incoming',
        captureVideo: true,
        captureAudio: true,
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
