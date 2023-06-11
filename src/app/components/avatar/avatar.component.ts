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

        this.removeElementsAfterBase64(this.urlOptions);

        if (this.isBase64(this.urlOptions[0])) {
            this.setBackgroundImage(this.urlOptions[0] as string);
            return;
        }

        const promises = this.urlOptions.map(url => Number(url)
            ? new Promise<string>((resolve) => {
                this.apiservice.getImage(url as number).subscribe({
                    next: imageDto => {
                        resolve(imageDto.content);
                    },
                    error: () => {
                        resolve(null);
                    }
                });
            })
            : Promise.resolve<string>(url as string));

        Promise.allSettled(promises).then((results) => {
            const urls = results
                .filter((result: PromiseFulfilledResult<string>) => result.status === 'fulfilled' && result.value)
                .map((result: PromiseFulfilledResult<string>) => result.value)
                .filter(url => url);

            urls.push(this.defaultPhotoUrl);

            this.removeElementsAfterBase64(urls);

            this.setBackgroundImage(...urls);
        });
    }

    private isBase64(value: (string | number)): boolean {
        return !Number(value) && !!(value as string).match(this.base64Regex);
    }

    private removeElementsAfterBase64(array: (string | number)[]): void {
        const base64Index = array.findIndex(x => this.isBase64(x));
        if (base64Index > -1) {
            array.length = base64Index + 1;
        }
    }

    private setBackgroundImage(...urls: string[]) {
        this.backgroundImage = urls.map(url => `url('${url}')`).join(', ');
    }
}
