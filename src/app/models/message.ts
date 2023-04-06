import { ILinkPreviewDto } from "../api-client/api-client";

export class Message {
    id?: number;
    text?: string | undefined;
    textHtml?: string | undefined;
    accountId?: number;
    isMine?: boolean | undefined;
    created?: Date;
    linkPreview?: ILinkPreviewDto;

    public constructor(init?:Partial<Message>) {
        Object.assign(this, init);
    }
}