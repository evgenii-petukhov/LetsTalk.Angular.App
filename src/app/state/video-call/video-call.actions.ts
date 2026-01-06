import { createActionGroup, emptyProps, props } from '@ngrx/store';

export const videoCallActions = createActionGroup({
    source: 'videoCall',
    events: {
        initOutgoingCall: props<{ chatId: string }>(),
        initIncomingCall: props<{ chatId: string; offer: string }>(),
        toggleVideo: emptyProps(),
        toggleAudio: emptyProps(),
        markCallAsDisconnected: emptyProps(),
        reset: emptyProps(),
    },
});
