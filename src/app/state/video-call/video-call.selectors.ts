import { createFeatureSelector, createSelector } from '@ngrx/store';
import { VideoCallState } from '../../models/video-call-state';

export const selectVideoCall =
    createFeatureSelector<VideoCallState>('videoCall');

export const selectIsCallInProgress = createSelector(
    selectVideoCall,
    (callState) => !!callState,
);
