import { Component, Input, OnInit } from '@angular/core';
import { errorMessages } from 'src/app/constants/errors';
import { ImageKey } from 'src/app/models/image-key';
import { ImagePreview } from 'src/app/models/imagePreview';
import { ErrorService } from 'src/app/services/error.service';
import { StoreService } from 'src/app/services/store.service';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-image',
    templateUrl: './image.component.html',
    styleUrls: ['./image.component.scss'],
    standalone: false,
})
export class ImageComponent implements OnInit {
    @Input() imagePreview: ImagePreview;
    @Input() imageKey: ImageKey;
    url: string;
    isLoading = true;
    isSizeUnknown = false;
    width = environment.imageSettings.limits.picturePreview.width;
    height = environment.imageSettings.limits.picturePreview.height;
    sizeLimit = environment.imageSettings.limits.picturePreview;

    constructor(
        private storeService: StoreService,
        private errorService: ErrorService,
    ) {}

    async ngOnInit(): Promise<void> {
        try {
            if (!this.imagePreview) {
                return;
            }

            this.setSize(this.imagePreview.width, this.imagePreview.height);

            if (this.imagePreview.id) {
                const image = await this.storeService.getImageContent({
                    imageId: this.imagePreview.id,
                    fileStorageTypeId: this.imagePreview.fileStorageTypeId,
                });
                if (image) {
                    this.url = image.content;
                    this.setSize(image.width, image.height);
                    this.isLoading = false;
                }
            }
        } catch (e) {
            this.errorService.handleError(e, errorMessages.downloadImage);
            this.url = null;
        }
    }

    openImageViewer(e: PointerEvent): void {
        e.preventDefault();
        if (this.imageKey?.imageId) {
            this.storeService.setViewedImageKey(this.imageKey);
        }
    }

    private setSize(width: number, height: number): void {
        if (!width || !height) {
            this.isSizeUnknown = true;
            return;
        }

        this.isSizeUnknown = false;
        const scale = Math.min(
            this.sizeLimit.width / width,
            this.sizeLimit.height / height,
            1,
        );
        this.width = Math.round(scale * width);
        this.height = Math.round(scale * height);
    }
}
