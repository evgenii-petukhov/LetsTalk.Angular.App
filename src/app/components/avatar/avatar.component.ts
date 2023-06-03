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
        const promises = this.urlOptions.map(url => Number(url)
            ? new Promise<string>((resolve) => {
                this.apiservice.getImage(url as number).subscribe(imageDto => {
                    resolve(imageDto.content);
                });
            })
            : Promise.resolve<string>(url as string));

        Promise.all(promises).then((urls: string[]) => {
            this.photoUrl = urls.find(url => url);
        });
    }
}
