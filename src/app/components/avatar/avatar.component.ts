import { Component, Input, OnChanges } from '@angular/core';
import { errorMessages } from 'src/app/constants/errors';
import { ImageUrlType } from 'src/app/enums/image-url-type';
import { ErrorService } from 'src/app/services/error.service';
import { StoreService } from 'src/app/services/store.service';

@Component({
    selector: 'app-avatar',
    templateUrl: './avatar.component.html',
    styleUrls: ['./avatar.component.scss'],
})
export class AvatarComponent implements OnChanges {
    @Input() urlOptions: (string | number)[];
    backgroundImage: string;
    private defaultPhotoUrl = 'images/empty-avatar.svg';

    constructor(
        private storeService: StoreService,
        private errorService: ErrorService,
    ) {}

    async ngOnChanges(): Promise<void> {
        this.urlOptions = this.urlOptions ?? [];
        this.urlOptions = this.urlOptions.filter((url) => url);
        if (this.urlOptions.length === 0) {
            this.setBackgroundImage(this.defaultPhotoUrl);
            return;
        }

        switch (this.getTypeInfo(this.urlOptions[0])) {
            case ImageUrlType.url:
                this.setBackgroundImage(
                    this.urlOptions[0] as string,
                    this.defaultPhotoUrl,
                );
                return;
            case ImageUrlType.imageId:
                try {
                    const image = await this.storeService.getImageContent(
                        this.urlOptions[0] as string,
                    );
                    this.setBackgroundImage(image.content);
                } catch (e) {
                    this.setBackgroundImage(this.defaultPhotoUrl);
                    this.errorService.handleError(
                        e,
                        errorMessages.downloadImage,
                    );
                }
                return;
            default:
                this.setBackgroundImage(this.defaultPhotoUrl);
                return;
        }
    }

    private getTypeInfo(value: string | number): ImageUrlType {
        const stringValue = value as string;

        if (
            stringValue.startsWith('http') ||
            stringValue.startsWith('blob:https')
        ) {
            return ImageUrlType.url;
        }

        if (stringValue) {
            return ImageUrlType.imageId;
        }

        return ImageUrlType.unknown;
    }

    private setBackgroundImage(...urls: string[]) {
        this.backgroundImage = urls.map((url) => `url('${url}')`).join(', ');
    }
}
