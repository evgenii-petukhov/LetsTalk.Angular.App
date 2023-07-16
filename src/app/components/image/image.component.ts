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
    @Input() imageId: number;
    url: string;
    isLoading = true;

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
    }

    openImageViewer(e: PointerEvent): void {
        e.preventDefault();
        this.storeService.setViewedImageId(this.imageId);
    }
}
