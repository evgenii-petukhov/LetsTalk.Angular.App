import { LinkPreview } from "./link-preview";

export class Message {
    id?: number;
    text?: string | undefined;
    accountId?: number;
    isMine?: boolean | undefined;
    created?: Date;
    linkPreview?: LinkPreview;
}