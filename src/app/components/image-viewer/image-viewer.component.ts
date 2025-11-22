import {
    Component,
    HostBinding,
    HostListener,
    OnDestroy,
    OnInit,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IImageDto } from 'src/app/api-client/api-client';
import { errorMessages } from 'src/app/constants/errors';
import { ErrorService } from 'src/app/services/error.service';
import { StoreService } from 'src/app/services/store.service';
import { Location } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'app-image-viewer',
    templateUrl: './image-viewer.component.html',
    styleUrls: ['./image-viewer.component.scss'],
    standalone: false,
})
export class ImageViewerComponent implements OnInit, OnDestroy {
    backgroundImage: string;
    private imageKey: IImageDto;
    @HostBinding('class.visible') isVisible: boolean = false;
    private unsubscribe$: Subject<void> = new Subject<void>();

    constructor(
        private storeService: StoreService,
        private errorService: ErrorService,
        private route: ActivatedRoute,
        private location: Location,
    ) {}

    @HostListener('click')
    close(): void {
        this.resetViewer();
    }

    ngOnInit(): void {
        this.route.params
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(async (params) => {
                if (!params || !params['imageKey']) return;

                const [id, fileStorageTypeId] = params['imageKey'].split('_');
                this.imageKey = {
                    id,
                    fileStorageTypeId: Number(fileStorageTypeId),
                };

                await this.loadImage();
            });
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

    private async loadImage(): Promise<void> {
        try {
            const image = await this.storeService.getImageContent(
                this.imageKey,
            );
            this.backgroundImage = image.content;
            this.isVisible = true;
        } catch (error) {
            this.errorService.handleError(error, errorMessages.downloadImage);
            this.resetViewer();
        }
    }

    private resetViewer(): void {
        this.backgroundImage = '';
        this.isVisible = false;
        this.location.back();
    }
}
