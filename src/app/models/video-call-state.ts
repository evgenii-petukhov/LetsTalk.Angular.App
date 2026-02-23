export interface VideoCallState {
    callId?: string;
    chatId?: string;
    offer?: string;
    type: 'outgoing' | 'incoming-awaiting' | 'incoming-active';
    captureVideo: boolean;
    captureAudio: boolean;
}