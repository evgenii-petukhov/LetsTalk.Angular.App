import { Component, Input, OnChanges } from '@angular/core';
import { StoreService } from 'src/app/services/store.service';

@Component({
    selector: 'app-image',
    templateUrl: './image.component.html',
    styleUrls: ['./image.component.scss'],
})
export class ImageComponent implements OnChanges {
    @Input() imageId: number;
    url: string;
    isLoading = true;

    constructor(
        private storeService: StoreService,
    ) { }

    ngOnChanges(): void {
        if (!this.imageId) {
            return;
        }

        this.isLoading = true;
        this.storeService.getImageContent(this.imageId).then(content => {
            this.url = content;
            this.isLoading = false;
        }).catch(e => {
            console.error(e);
        });
    }
}
