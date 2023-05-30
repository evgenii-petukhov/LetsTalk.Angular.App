import { Component, Input, OnChanges } from '@angular/core';

@Component({
    selector: 'app-avatar',
    templateUrl: './avatar.component.html',
    styleUrls: ['./avatar.component.scss'],
})
export class AvatarComponent implements OnChanges {
    @Input() urlOptions: string[];
    photoUrl: string;

    ngOnChanges(): void {
        if (this.urlOptions) {
            const photoUrl = this.urlOptions.find(url => url);
            if (photoUrl) {
                this.photoUrl = photoUrl;
                return;
            }
        }
        this.photoUrl = 'images/empty-avatar.svg';
    }
}
