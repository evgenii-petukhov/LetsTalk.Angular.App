import { Component, HostBinding, Input, OnChanges } from '@angular/core';
import { IImageDto } from 'src/app/api-client/api-client';
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
    @Input() imageKey: IImageDto;
    @HostBinding('class.visible') isVisible: boolean = false;

    constructor(
        private storeService: StoreService,
        private errorService: ErrorService,
    ) {}

    async ngOnChanges(): Promise<void> {
        if (!this.imageKey) {
            this.resetViewer();
            return;
        }

        await this.loadImage();
    }

    close() {
        this.storeService.setViewedImageKey(null);
        this.resetViewer();
    }

    private async loadImage(): Promise<void> {
        try {
            const image = await this.storeService.getImageContent(
                this.imageKey,
            );
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
