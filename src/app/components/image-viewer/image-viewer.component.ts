import { Component, HostBinding, Input, OnChanges } from '@angular/core';
import { errorMessages } from 'src/app/constants/errors';
import { ErrorService } from 'src/app/services/error.service';
import { StoreService } from 'src/app/services/store.service';

@Component({
    selector: 'app-image-viewer',
    templateUrl: './image-viewer.component.html',
    styleUrls: ['./image-viewer.component.scss'],
    standalone: false,
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
            this.resetViewer();
            return;
        }

        await this.loadImage(this.imageId);
    }

    close() {
        this.storeService.setViewedImageId(null);
        this.resetViewer();
    }

    private async loadImage(imageId: string): Promise<void> {
        try {
            const image = await this.storeService.getImageContent(imageId);
            this.backgroundImage = `url('${image.content}')`;
            this.isVisible = true;
        } catch (error) {
            this.errorService.handleError(error, errorMessages.downloadImage);
            this.resetViewer();
        }
    }

    private resetViewer(): void {
        this.backgroundImage = '';
        this.isVisible = false;
    }
}
