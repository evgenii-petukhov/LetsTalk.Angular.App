import { ImagePreviewDto } from "../api-client/api-client";

export class ImagePreview {
    messageId?: string;
    id?: number;
    accountId?: string;
    width?: number | undefined;
    height?: number | undefined;

    constructor(init?: Partial<ImagePreview | ImagePreviewDto>) {
        Object.assign(this, init);
    }
}
