import { IAccountDto } from "../api-client/api-client";

export interface VideoCall {
    callId?: string;
    chatId?: string;
    offer?: string;
    caller?: IAccountDto;
    status: 'outgoing' | 'incoming-awaiting' | 'incoming-active';
    captureVideo: boolean;
    captureAudio: boolean;
}