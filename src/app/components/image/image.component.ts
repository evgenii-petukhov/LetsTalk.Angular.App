import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { StoreService } from 'src/app/services/store.service';

@Component({
    selector: 'app-image',
    templateUrl: './image.component.html',
    styleUrls: ['./image.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImageComponent implements OnInit {
    @Input() imagePreviewId: number;
    @Input() sourcePreviewWidth: number;
    @Input() sourcePreviewHeight: number;
    @Input() imageId: number;
    url: string;
    isLoading = true;
    previewWidth = 150;
    previewHeight = 150;
    private previewMaxWidth = 150;
    private previewMaxHeight = 150;

    constructor(
        private storeService: StoreService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        if (!this.imagePreviewId) {
            return;
        }

        this.storeService.getImageContent(this.imagePreviewId).then(content => {
            this.url = content;
            this.isLoading = false;
            this.cdr.detectChanges();
        }).catch(e => {
            console.error(e);
        });

        if (this.sourcePreviewWidth && this.sourcePreviewHeight) {
            const scaleX = this.sourcePreviewWidth > this.previewMaxWidth ? this.previewMaxWidth / this.sourcePreviewWidth : 1;
            const scaleY = this.sourcePreviewHeight > this.previewMaxHeight ? this.previewMaxHeight / this.sourcePreviewHeight : 1;
            const scale = Math.min(scaleX, scaleY);
            this.previewWidth = scale * this.sourcePreviewWidth;
            this.previewHeight = scale * this.sourcePreviewHeight;
        }
    }

    openImageViewer(e: PointerEvent): void {
        e.preventDefault();
        this.storeService.setViewedImageId(this.imageId);
    }
}
