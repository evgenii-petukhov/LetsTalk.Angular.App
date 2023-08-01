import { ImagePreviewDto } from "../api-client/api-client";

export class ImagePreview {
    messageId?: number;
    id?: number;
    accountId?: number;
    width?: number | undefined;
    height?: number | undefined;

    constructor(init?: Partial<ImagePreview | ImagePreviewDto>) {
        Object.assign(this, init);
    }
}
