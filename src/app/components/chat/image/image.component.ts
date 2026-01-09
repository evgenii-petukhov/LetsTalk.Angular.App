import { Component, inject, Input, OnInit, signal } from '@angular/core';
import { IImageDto } from 'src/app/api-client/api-client';
import { errorMessages } from 'src/app/constants/errors';
import { ImagePreview } from 'src/app/models/image-preview';
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
    @Input() imageKey: IImageDto;
    @Input() chatId: string;
    url = signal<string>(null);
    isLoading = signal(true);
    isSizeUnknown = signal(false);
    width = signal(environment.imageSettings.limits.picturePreview.width);
    height = signal(environment.imageSettings.limits.picturePreview.height);
    sizeLimit = environment.imageSettings.limits.picturePreview;
    imageKeyParam: string;

    private readonly storeService = inject(StoreService);
    private readonly errorService = inject(ErrorService);

    async ngOnInit(): Promise<void> {
        this.imageKeyParam = this.imageKey
            ? `${this.imageKey.id}_${this.imageKey.fileStorageTypeId}`
            : null;

        try {
            if (!this.imagePreview) {
                return;
            }

            this.setSize(this.imagePreview.width, this.imagePreview.height);

            if (this.imagePreview.id) {
                const image = await this.storeService.getImageContent(
                    this.imagePreview,
                );
                if (image) {
                    this.url.set(image.content);
                    this.setSize(image.width, image.height);
                    this.isLoading.set(false);
                }
            }
        } catch (e) {
            this.errorService.handleError(e, errorMessages.downloadImage);
            this.url.set(null);
        }
    }

    private setSize(width: number, height: number): void {
        if (!width || !height) {
            this.isSizeUnknown.set(true);
            return;
        }

        this.isSizeUnknown.set(false);
        const scale = Math.min(
            this.sizeLimit.width / width,
            this.sizeLimit.height / height,
            1,
        );
        this.width.set(Math.round(scale * width));
        this.height.set(Math.round(scale * height));
    }
}
