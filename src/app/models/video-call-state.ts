import { IAccountDto } from "../api-client/api-client";

export interface VideoCallState {
    callId?: string;
    chatId?: string;
    offer?: string;
    caller?: IAccountDto;
    type: 'outgoing' | 'incoming-awaiting' | 'incoming-active';
    captureVideo: boolean;
    captureAudio: boolean;
}