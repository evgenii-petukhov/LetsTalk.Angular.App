import { Component, Input, OnChanges } from '@angular/core';
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

        const urlInfos = this.urlOptions.map(url => ({
            content: url,
            typeInfo: this.getTypeInfo(url)
        }));

        if (urlInfos[0].typeInfo.isBase64) {
            this.setBackgroundImage(urlInfos[0].content as string);
            return;
        }

        if (urlInfos[0].typeInfo.isUrl) {
            this.setBackgroundImage(urlInfos[0].content as string, this.defaultPhotoUrl);
            return;
        }

        this.apiservice.getImage(urlInfos[0].content as number).subscribe({
            next: imageDto => {
                this.setBackgroundImage(imageDto.content);
            },
            error: () => {
                this.setBackgroundImage(this.defaultPhotoUrl);
            }
        });
    }

    private getTypeInfo(value: (string | number)): {
        isNumber: boolean;
        isBase64: boolean;
        isUrl: boolean;
    } {
        const isNumber = !!Number(value);
        return {
            isNumber,
            isBase64: !isNumber && !!(value as string).match(this.base64Regex),
            isUrl: !isNumber && (value as string).startsWith('http')
        };
    }

    private setBackgroundImage(...urls: string[]) {
        this.backgroundImage = urls.map(url => `url('${url}')`).join(', ');
    }
}
