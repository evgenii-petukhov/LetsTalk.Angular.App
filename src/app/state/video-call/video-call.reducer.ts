import { createReducer, on } from '@ngrx/store';
import { VideoCallState } from 'src/app/models/video-call-state';
import { videoCallActions } from './video-call.actions';

export const initialState: VideoCallState = null;

export const videoCallReducer = createReducer(
    initialState,
    on(videoCallActions.init, (_state, { settings }) => settings),
);
