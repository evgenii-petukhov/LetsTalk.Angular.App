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

    constructor(...inits: Partial<Message | IMessageDto>[]) {
        inits.forEach(init => {
            const linkPreview = init?.linkPreview ?? this?.linkPreview;
            Object.assign(this, {...this, ...init});
            this.linkPreview = linkPreview ? new LinkPreview(linkPreview) : null;
            const created = (init as IMessageDto)?.created as any;
            if (created && !(created instanceof Date)) {
                this.created = new Date(0);
                this.created.setUTCSeconds(created);
            }
        });
    }
}
