import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Input,
    OnInit,
} from '@angular/core';
import { errorMessages } from 'src/app/constants/errors';
import { ImagePreview } from 'src/app/models/imagePreview';
import { ErrorService } from 'src/app/services/error.service';
import { StoreService } from 'src/app/services/store.service';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-image',
    templateUrl: './image.component.html',
    styleUrls: ['./image.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
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
        private errorService: ErrorService,
        private cdr: ChangeDetectorRef,
    ) {}

    async ngOnInit(): Promise<void> {
        if (!this.imagePreview) {
            return;
        }

        this.setSize(this.imagePreview.width, this.imagePreview.height);

        try {
            const image = await this.storeService.getImageContent(
                this.imagePreview.id,
            );
            this.url = image.content;
            this.setSize(image.width, image.height);
            this.isLoading = false;
            this.cdr.detectChanges();
        } catch (e) {
            this.errorService.handleError(e, errorMessages.downloadImage);
        }
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

        const scaleX =
            width > this.sizeLimit.width ? this.sizeLimit.width / width : 1;
        const scaleY =
            height > this.sizeLimit.height ? this.sizeLimit.height / height : 1;
        const scale = Math.min(scaleX, scaleY);
        this.width = scale * width;
        this.height = scale * height;
    }
}
