import { VideoCallType } from "./video-call-type";

export interface VideoCallState {
    chatId?: string;
    offer?: string;
    type: VideoCallType;
    captureVideo: boolean;
    captureAudio: boolean;
}