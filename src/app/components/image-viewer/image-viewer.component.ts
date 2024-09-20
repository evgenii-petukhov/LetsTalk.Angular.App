import { Component, HostBinding, Input, OnChanges } from '@angular/core';
import { errorMessages } from 'src/app/constants/errors';
import { ErrorService } from 'src/app/services/error.service';
import { StoreService } from 'src/app/services/store.service';

@Component({
    selector: 'app-image-viewer',
    templateUrl: './image-viewer.component.html',
    styleUrls: ['./image-viewer.component.scss'],
})
export class ImageViewerComponent implements OnChanges {
    backgroundImage: string;
    @Input() imageId: string;
    @HostBinding('class.visible') isVisible: boolean = false;

    constructor(
        private storeService: StoreService,
        private errorService: ErrorService,
    ) {}

    async ngOnChanges(): Promise<void> {
        if (!this.imageId) {
            this.isVisible = false;
            return;
        }

        try {
            const image = await this.storeService.getImageContent(this.imageId);
            this.setBackgroundImage(image.content);
            this.isVisible = true;
        } catch (e) {
            this.errorService.handleError(e, errorMessages.downloadImage);
        }
    }

    close() {
        this.storeService.setViewedImageId(null);
        this.isVisible = false;
    }

    private setBackgroundImage(...urls: string[]) {
        this.backgroundImage = urls.map((url) => `url('${url}')`).join(', ');
    }
}
