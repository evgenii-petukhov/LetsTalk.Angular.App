import { createFeatureSelector } from '@ngrx/store';
import { VideoCallState } from 'src/app/models/video-call-state';

export const selectVideoCall =
    createFeatureSelector<VideoCallState>('videoCall');
