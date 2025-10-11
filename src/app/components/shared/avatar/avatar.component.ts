import { Component, Input, OnChanges } from '@angular/core';
import { IImageDto } from 'src/app/api-client/api-client';
import { errorMessages } from 'src/app/constants/errors';
import { ErrorService } from 'src/app/services/error.service';
import { StoreService } from 'src/app/services/store.service';

@Component({
    selector: 'app-avatar',
    templateUrl: './avatar.component.html',
    styleUrls: ['./avatar.component.scss'],
    standalone: false,
})
export class AvatarComponent implements OnChanges {
    @Input() urlOptions: (string | IImageDto)[] | null = null;
    backgroundImage: string = '';
    private readonly defaultPhotoUrl = 'images/empty-avatar.svg';

    constructor(
        private storeService: StoreService,
        private errorService: ErrorService,
    ) {}

    ngOnChanges(): void {
        this.processUrlOptions();
    }

    private async processUrlOptions(): Promise<void> {
        const urlOptions = this.urlOptions?.filter(Boolean) ?? [];

        if (urlOptions.length === 0) {
            this.setBackgroundImage(this.defaultPhotoUrl);
            return;
        }

        const primaryOption = urlOptions[0];

        if (this.isImageDto(primaryOption)) {
            await this.loadImageFromStore(primaryOption);
        } else if (this.isValidUrl(primaryOption)) {
            this.setBackgroundImage(primaryOption, this.defaultPhotoUrl);
        } else {
            this.setBackgroundImage(this.defaultPhotoUrl);
        }
    }

    private async loadImageFromStore(imageKey: IImageDto): Promise<void> {
        try {
            const image = await this.storeService.getImageContent(imageKey);
            this.setBackgroundImage(image.content);
        } catch (error) {
            this.setBackgroundImage(this.defaultPhotoUrl);
            this.errorService.handleError(error, errorMessages.downloadImage);
        }
    }

    private isImageDto(value: any): value is IImageDto {
        return value && typeof value === 'object' && 'id' in value && 'fileStorageTypeId' in value;
    }

    private isValidUrl(value: string): boolean {
        return typeof value === 'string' && (value.startsWith('http') || value.startsWith('blob:https'));
    }

    private setBackgroundImage(...urls: string[]): void {
        this.backgroundImage = urls.map((url) => `url('${url}')`).join(', ');
    }
}
