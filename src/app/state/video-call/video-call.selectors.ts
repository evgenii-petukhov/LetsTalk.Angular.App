import { createFeatureSelector } from '@ngrx/store';
import { VideoCallState } from '../../models/video-call-state';

export const selectVideoCall =
    createFeatureSelector<VideoCallState>('videoCall');
