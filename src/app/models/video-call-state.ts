export interface VideoCallState {
    callId?: string;
    chatId?: string;
    offer?: string;
    type: 'outgoing' | 'incoming';
    captureVideo: boolean;
    captureAudio: boolean;
}