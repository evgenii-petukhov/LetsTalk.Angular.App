export interface VideoCallState {
    chatId?: string;
    accountId: string;
    offer?: string;
    isIncoming: boolean;
}