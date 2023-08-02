import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges } from '@angular/core';
import { ImagePreview } from 'src/app/models/imagePreview';
import { StoreService } from 'src/app/services/store.service';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-image',
    templateUrl: './image.component.html',
    styleUrls: ['./image.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImageComponent implements OnChanges {
    @Input() imagePreview: ImagePreview;
    @Input() imageId: number;
    url: string;
    isLoading = true;
    previewWidth = (environment as any).picturePreviewMaxWidth;
    previewHeight = (environment as any).picturePreviewMaxHeight;
    private previewMaxWidth = (environment as any).picturePreviewMaxWidth;
    private previewMaxHeight = (environment as any).picturePreviewMaxHeight;

    constructor(
        private storeService: StoreService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnChanges(): void {
        if (!this.imagePreview) {
            return;
        }

        this.storeService.getImageContent(this.imagePreview.id).then(image => {
            this.url = image.content;
            this.setPreviewDimensions(image.width, image.height);
            this.isLoading = false;
            this.cdr.detectChanges();
        }).catch(e => {
            console.error(e);
        });

        if (this.imagePreview.width && this.imagePreview.height) {
            this.setPreviewDimensions(this.imagePreview.width, this.imagePreview.height);
        }
    }

    openImageViewer(e: PointerEvent): void {
        e.preventDefault();
        this.storeService.setViewedImageId(this.imageId);
    }

    private setPreviewDimensions(width: number, height: number): void {
        const scaleX = width > this.previewMaxWidth ? this.previewMaxWidth / width : 1;
        const scaleY = height > this.previewMaxHeight ? this.previewMaxHeight / height : 1;
        const scale = Math.min(scaleX, scaleY);
        this.previewWidth = scale * width;
        this.previewHeight = scale * height;
    }
}
