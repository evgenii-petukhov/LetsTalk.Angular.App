import { Component, Input, OnChanges } from '@angular/core';
import { ImageUrlType } from 'src/app/enums/image-url-type';
import { Base64Service } from 'src/app/services/base64.service';
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
        private base64Service: Base64Service
    ) { }

    ngOnChanges(): void {
        this.urlOptions = this.urlOptions ?? [];
        this.urlOptions = this.urlOptions.filter(url => url);
        if (this.urlOptions.length === 0) {
            this.setBackgroundImage(this.defaultPhotoUrl);
            return;
        }

        switch (this.getTypeInfo(this.urlOptions[0])) {
            case ImageUrlType.base64:
                this.setBackgroundImage(this.urlOptions[0] as string);
                return;
            case ImageUrlType.url:
                this.setBackgroundImage(this.urlOptions[0] as string, this.defaultPhotoUrl);
                return;
            case ImageUrlType.imageId:
                this.storeService.getImage(this.urlOptions[0] as number).then(content => {
                    this.setBackgroundImage(content);
                }).catch(() => {
                    this.setBackgroundImage(this.defaultPhotoUrl);
                });
                return;
            default:
                this.setBackgroundImage(this.defaultPhotoUrl);
                return;
        }
    }

    private getTypeInfo(value: (string | number)): ImageUrlType {
        if (Number(value)) {
            return ImageUrlType.imageId;
        }

        const stringValue = (value as string);

        if (this.base64Service.isBase64Image(stringValue)) {
            return ImageUrlType.base64;
        }

        if (stringValue.startsWith('http')) {
            return ImageUrlType.url;
        }

        return ImageUrlType.unknown;
    }

    private setBackgroundImage(...urls: string[]) {
        this.backgroundImage = urls.map(url => `url('${url}')`).join(', ');
    }
}
