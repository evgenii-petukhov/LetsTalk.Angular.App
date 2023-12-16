import { Component, Input, OnChanges } from '@angular/core';
import { ImageUrlType } from 'src/app/enums/image-url-type';
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
    ) { }

    ngOnChanges(): void {
        this.urlOptions = this.urlOptions ?? [];
        this.urlOptions = this.urlOptions.filter(url => url);
        if (this.urlOptions.length === 0) {
            this.setBackgroundImage(this.defaultPhotoUrl);
            return;
        }

        switch (this.getTypeInfo(this.urlOptions[0])) {
            case ImageUrlType.url:
                this.setBackgroundImage(this.urlOptions[0] as string, this.defaultPhotoUrl);
                return;
            case ImageUrlType.imageId:
                this.storeService.getImageContent(this.urlOptions[0] as string).then(image => {
                    this.setBackgroundImage(image.content);
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
        const stringValue = (value as string);

        if (stringValue.startsWith('http') || stringValue.startsWith('blob:https')) {
            return ImageUrlType.url;
        }

        if (stringValue) {
            return ImageUrlType.imageId;
        }

        return ImageUrlType.unknown;
    }

    private setBackgroundImage(...urls: string[]) {
        this.backgroundImage = urls.map(url => `url('${url}')`).join(', ');
    }
}
