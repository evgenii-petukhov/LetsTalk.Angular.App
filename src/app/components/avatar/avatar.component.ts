import { Component, Input, OnChanges } from '@angular/core';
import { errorMessages } from 'src/app/constants/errors';
import { ImageUrlType } from 'src/app/enums/image-url-type';
import { ImageKey } from 'src/app/models/image-key';
import { ErrorService } from 'src/app/services/error.service';
import { StoreService } from 'src/app/services/store.service';

@Component({
    selector: 'app-avatar',
    templateUrl: './avatar.component.html',
    styleUrls: ['./avatar.component.scss'],
    standalone: false,
})
export class AvatarComponent implements OnChanges {
    @Input() urlOptions: (string | number)[] | null = null;
    @Input() fileStorageTypeId: number;
    backgroundImage: string = '';
    private readonly defaultPhotoUrl = 'images/empty-avatar.svg';

    constructor(
        private storeService: StoreService,
        private errorService: ErrorService,
    ) {}

    ngOnChanges(): void {
        this.processUrlOptions();
    }

    private async processUrlOptions(): Promise<void> {
        const urlOptions = this.urlOptions?.filter((url) => !!url) ?? [];

        if (urlOptions.length === 0) {
            this.setBackgroundImage(this.defaultPhotoUrl);
            return;
        }

        const primaryUrl = urlOptions[0];
        const type = this.getTypeInfo(primaryUrl);

        if (type === ImageUrlType.url) {
            this.setBackgroundImage(primaryUrl as string, this.defaultPhotoUrl);
        } else if (type === ImageUrlType.imageId) {
            await this.loadImageFromStore({
                imageId: primaryUrl as string,
                fileStorageTypeId: this.fileStorageTypeId,
            });
        } else {
            this.setBackgroundImage(this.defaultPhotoUrl);
        }
    }

    private async loadImageFromStore(imageKey: ImageKey): Promise<void> {
        try {
            const image = await this.storeService.getImageContent(imageKey);
            this.setBackgroundImage(image.content);
        } catch (error) {
            this.setBackgroundImage(this.defaultPhotoUrl);
            this.errorService.handleError(error, errorMessages.downloadImage);
        }
    }

    private getTypeInfo(value: string | number): ImageUrlType {
        if (typeof value === 'string') {
            return value.startsWith('http') || value.startsWith('blob:https')
                ? ImageUrlType.url
                : ImageUrlType.imageId;
        }
        return ImageUrlType.unknown;
    }

    private setBackgroundImage(...urls: string[]): void {
        this.backgroundImage = urls.map((url) => `url('${url}')`).join(', ');
    }
}
