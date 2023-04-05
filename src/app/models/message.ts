import { LinkPreview } from "./link-preview";

export class Message {
    id?: number;
    text?: string | undefined;
    textHtml?: string | undefined;
    accountId?: number;
    isMine?: boolean | undefined;
    created?: Date;
    linkPreview?: LinkPreview;

    public constructor(init?:Partial<Message>) {
        Object.assign(this, init);
    }
}