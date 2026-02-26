import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { IAccountDto } from 'src/app/api-client/api-client';

export const videoCallActions = createActionGroup({
    source: 'videoCall',
    events: {
        initOutgoingCall: props<{ chatId: string }>(),
        initIncomingCall: props<{ callId: string; chatId: string; offer: string, caller: IAccountDto }>(),
        acceptIncomingCall: emptyProps(),
        setCallId: props<{ callId: string; }>(),
        toggleVideo: emptyProps(),
        toggleAudio: emptyProps(),
        reset: emptyProps(),
    },
});
