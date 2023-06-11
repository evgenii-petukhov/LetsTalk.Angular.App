import { Component, Input, OnChanges } from '@angular/core';
import { AvatarTypes } from 'src/app/enums/avatar-types';
import { ApiService } from 'src/app/services/api.service';

@Component({
    selector: 'app-avatar',
    templateUrl: './avatar.component.html',
    styleUrls: ['./avatar.component.scss'],
})
export class AvatarComponent implements OnChanges {
    @Input() urlOptions: (string | number)[];
    backgroundImage: string;
    private defaultPhotoUrl = 'images/empty-avatar.svg';
    private base64Regex = /data:image\/(jpeg|png|gif){1};base64,([^\\"]*)/g;

    constructor(
        private apiservice: ApiService
    ) { }

    ngOnChanges(): void {
        this.urlOptions = this.urlOptions ?? [];
        this.urlOptions = this.urlOptions.filter(url => url);
        if (this.urlOptions.length === 0) {
            this.setBackgroundImage(this.defaultPhotoUrl);
            return;
        }

        switch(this.getTypeInfo(this.urlOptions[0])) {
            case AvatarTypes.base64:
                this.setBackgroundImage(this.urlOptions[0] as string);
                return;
            case AvatarTypes.url:
                this.setBackgroundImage(this.urlOptions[0] as string, this.defaultPhotoUrl);
                return;
            case AvatarTypes.imageId:
                this.apiservice.getImage(this.urlOptions[0] as number).subscribe({
                    next: imageDto => {
                        this.setBackgroundImage(imageDto.content);
                    },
                    error: () => {
                        this.setBackgroundImage(this.defaultPhotoUrl);
                    }
                });
                return;
            default:
                this.setBackgroundImage(this.defaultPhotoUrl);
                return;
        }
    }

    private getTypeInfo(value: (string | number)): AvatarTypes {
        const isNumber = !!Number(value);

        if (isNumber) {
            return AvatarTypes.imageId;
        }

        if (!isNumber && !!(value as string).match(this.base64Regex)) {
            return AvatarTypes.base64;
        }

        if (!isNumber && (value as string).startsWith('http')) {
            return AvatarTypes.url;
        }

        return AvatarTypes.unknown;
    }

    private setBackgroundImage(...urls: string[]) {
        this.backgroundImage = urls.map(url => `url('${url}')`).join(', ');
    }
}
