export interface VideoCallState {
    chatId?: string;
    offer?: string;
    type: 'outgoing' | 'incoming';
    captureVideo: boolean;
    captureAudio: boolean;
    isDisconnected: boolean;
}