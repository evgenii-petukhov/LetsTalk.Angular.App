import { createActionGroup, props } from '@ngrx/store';
import { VideoCallState } from 'src/app/models/video-call-state';

export const videoCallActions = createActionGroup({
    source: 'videoCall',
    events: {
        init: props<{ settings: VideoCallState }>(),
    },
});