import { IMessageDto } from '../api-client/api-client';
import { LinkPreview } from './linkPreview';

export class Message {
    id?: number;
    text?: string | undefined;
    textHtml?: string | undefined;
    accountId?: number;
    isMine?: boolean | undefined;
    created?: Date;
    linkPreview?: LinkPreview;

    constructor(init?: Partial<Message | IMessageDto>) {
        Object.assign(this, init);
        this.linkPreview = init.linkPreview ? new LinkPreview(init.linkPreview) : null;
        const created = (init as IMessageDto).created as any;
        if (created && !(created instanceof Date)) {
            this.created = new Date(0);
            this.created.setUTCSeconds(created);
        }
    }
}
