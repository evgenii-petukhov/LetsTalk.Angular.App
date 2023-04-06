export class LinkPreview {
    messageId?: number;
    accountId?: number;
    title?: string | undefined;
    imageUrl?: string | undefined;
    url?: string | undefined;

    constructor(init?:Partial<LinkPreview>) {
        Object.assign(this, init);
    }
}