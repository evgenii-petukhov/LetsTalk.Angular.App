import { IMessageDto } from '../api-client/api-client';
import { LinkPreview } from './linkPreview';
import { isOfType } from '../helpers/type-utils';
import { getLocalDate } from '../helpers/date-utils';

export class Message {
    id?: number;
    text?: string | undefined;
    textHtml?: string | undefined;
    senderId?: number;
    recipientId?: number;
    isMine?: boolean | undefined;
    created?: Date;
    linkPreview?: LinkPreview;

    constructor(...inits: Partial<Message | IMessageDto>[]) {
        inits.filter(init => init).forEach(init => {
            const linkPreview = this.linkPreview ?? init?.linkPreview;
            const created = this.created ?? init?.created;
            Object.assign(this, init);
            if (linkPreview) {
                this.linkPreview = isOfType(linkPreview, LinkPreview) ? linkPreview : new LinkPreview(linkPreview);
            }
            if (created) {
                this.created = isOfType(created, Date) ? created as Date : getLocalDate(created as number);
            }
        });
    }
}
