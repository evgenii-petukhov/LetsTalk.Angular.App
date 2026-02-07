import { createActionGroup, emptyProps, props } from '@ngrx/store';

export const videoCallActions = createActionGroup({
    source: 'videoCall',
    events: {
        initOutgoingCall: props<{ chatId: string }>(),
        initIncomingCall: props<{ callId: string; chatId: string; offer: string }>(),
        toggleVideo: emptyProps(),
        toggleAudio: emptyProps(),
        reset: emptyProps(),
    },
});
