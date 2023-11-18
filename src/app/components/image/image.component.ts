import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { ImagePreview } from 'src/app/models/imagePreview';
import { StoreService } from 'src/app/services/store.service';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-image',
    templateUrl: './image.component.html',
    styleUrls: ['./image.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImageComponent implements OnInit {
    @Input() imagePreview: ImagePreview;
    @Input() imageId: string;
    url: string;
    isLoading = true;
    isSizeUnknown = false;
    width = environment.imageSettings.limits.picturePreview.width;
    height = environment.imageSettings.limits.picturePreview.height;
    sizeLimit = environment.imageSettings.limits.picturePreview;

    constructor(
        private storeService: StoreService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        if (!this.imagePreview) {
            return;
        }

        this.storeService.getImageContent(this.imagePreview.id).then(image => {
            this.url = image.content;
            this.setSize(image.width, image.height);
            this.isLoading = false;
            this.cdr.detectChanges();
        }).catch(e => {
            console.error(e);
        });

        this.setSize(this.imagePreview.width, this.imagePreview.height);
    }

    openImageViewer(e: PointerEvent): void {
        e.preventDefault();
        this.storeService.setViewedImageId(this.imageId);
    }

    private setSize(width: number, height: number): void {
        this.isSizeUnknown = !width || !height;

        if (this.isSizeUnknown) {
            return;
        }

        const scaleX = width > this.sizeLimit.width ? this.sizeLimit.width / width : 1;
        const scaleY = height > this.sizeLimit.height ? this.sizeLimit.height / height : 1;
        const scale = Math.min(scaleX, scaleY);
        this.width = scale * width;
        this.height = scale * height;
    }
}
