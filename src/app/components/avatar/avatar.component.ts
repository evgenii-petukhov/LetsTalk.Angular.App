import { Component, Input, OnChanges } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';

@Component({
    selector: 'app-avatar',
    templateUrl: './avatar.component.html',
    styleUrls: ['./avatar.component.scss'],
})
export class AvatarComponent implements OnChanges {
    @Input() urlOptions: string[];
    @Input() imageId: number;
    photoUrl: string;
    private defaultPhotoUrl = 'images/empty-avatar.svg';

    constructor(
        private apiservice: ApiService
    ) {

    }

    ngOnChanges(): void {
        this.urlOptions = this.urlOptions ?? [];
        this.urlOptions.push(this.defaultPhotoUrl);
        if (this.imageId) {
            this.apiservice.getImage(this.imageId).subscribe(imageDto => {
                this.urlOptions = [imageDto.content, ...this.urlOptions];
                this.photoUrl = this.urlOptions.find(url => url);
            });
        } else {
            this.photoUrl = this.urlOptions.find(url => url);
        }
    }
}
