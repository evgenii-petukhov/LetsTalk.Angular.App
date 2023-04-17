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
        inits.filter(x => x).forEach(init => {
            const linkPreview = this.linkPreview ?? init?.linkPreview;
            const created = this.created ?? init?.created;

            Object.assign(this, {...this, ...init});

            if (linkPreview) {
                if (linkPreview instanceof LinkPreview) {
                    this.linkPreview = linkPreview;
                } else {
                    this.linkPreview = new LinkPreview(linkPreview);
                }
            }
            if (created) {
                if ((created instanceof Date)) {
                    this.created = created;
                } else {
                    this.created = new Date(0);
                    this.created.setUTCSeconds(created);
                }
            }
        });
    }
}
