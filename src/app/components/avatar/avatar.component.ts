import { Component, Input, OnChanges } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';

@Component({
    selector: 'app-avatar',
    templateUrl: './avatar.component.html',
    styleUrls: ['./avatar.component.scss'],
})
export class AvatarComponent implements OnChanges {
    @Input() urlOptions: (string | number)[];
    photoUrl: string;
    private defaultPhotoUrl = 'images/empty-avatar.svg';

    constructor(
        private apiservice: ApiService
    ) { }

    ngOnChanges(): void {
        this.urlOptions = this.urlOptions ?? [];
        this.urlOptions.push(this.defaultPhotoUrl);
        const promises = this.urlOptions.filter(url => url).map(url => Number(url)
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
            this.photoUrl = results
                .filter((result: PromiseFulfilledResult<string>) => result.status === 'fulfilled' && result.value)
                .map((result: PromiseFulfilledResult<string>) => result.value)
                .find(url => url);
        });
    }
}
