import { IAccountDto } from "../api-client/api-client";

export interface IncomingCall {
    callId?: string;
    offer?: string;
    chatId?: string;
    caller?: IAccountDto;
}