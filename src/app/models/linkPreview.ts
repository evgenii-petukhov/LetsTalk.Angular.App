export class LinkPreview {
    accountId?: number;
    title?: string | undefined;
    imageUrl?: string | undefined;
    url?: string | undefined;

    constructor(init?: Partial<LinkPreview>) {
        Object.assign(this, init);
    }
}
