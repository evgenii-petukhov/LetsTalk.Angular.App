import { IMessageDto } from '../api-client/api-client';
import { LinkPreview } from './linkPreview';
import { isOfType } from '../helpers/type-utils.helper';
import { getLocalDate } from '../helpers/date-utils.helper';
import { ImagePreview } from './imagePreview';

export class Message {
    id?: string;
    text?: string | undefined;
    textHtml?: string | undefined;
    recipientId?: string;
    isMine?: boolean | undefined;
    created?: Date;
    linkPreview?: LinkPreview;
    imageId?: number | undefined;
    imagePreview?: ImagePreview;

    constructor(...inits: Partial<Message | IMessageDto>[]) {
        inits.filter(init => init).forEach(init => {
            const linkPreview = this.linkPreview ?? init?.linkPreview;
            const imagePreview = this.imagePreview ?? init?.imagePreview;
            const created = this.created ?? init?.created;
            Object.assign(this, init);
            if (linkPreview) {
                this.linkPreview = isOfType(linkPreview, LinkPreview) ? linkPreview : new LinkPreview(linkPreview);
            }
            if (imagePreview) {
                this.imagePreview = isOfType(imagePreview, ImagePreview) ? imagePreview : new ImagePreview(imagePreview);
            }
            if (created) {
                this.created = isOfType(created, Date) ? created as Date : getLocalDate(created as number);
            }
        });
    }
}
