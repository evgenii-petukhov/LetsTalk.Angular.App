import { Component, Input, OnChanges } from '@angular/core';

@Component({
    selector: 'app-avatar',
    templateUrl: './avatar.component.html',
    styleUrls: ['./avatar.component.scss'],
})
export class AvatarComponent implements OnChanges {
    @Input() urlOptions: string[];
    photoUrl: string;
    private defaultPhotoUrl = 'images/empty-avatar.svg';

    ngOnChanges(): void {
        this.urlOptions = this.urlOptions ?? [];
        this.urlOptions.push(this.defaultPhotoUrl);
        this.photoUrl = this.urlOptions.find(url => url);
    }
}
