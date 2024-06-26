import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';
import { StoreService } from 'src/app/services/store.service';
import { selectViewedImageId } from 'src/app/state/viewed-image-id/viewed-image-id.selectors';

@Component({
    selector: 'app-image-viewer',
    templateUrl: './image-viewer.component.html',
    styleUrls: ['./image-viewer.component.scss']
})
export class ImageViewerComponent implements OnInit, OnDestroy {
    backgroundImage: string;
    private unsubscribe$: Subject<void> = new Subject<void>();

    constructor(
        private storeService: StoreService,
        private store: Store) { }

    ngOnInit(): void {
        this.store.select(selectViewedImageId).pipe(takeUntil(this.unsubscribe$)).subscribe(imageId => {
            if (!imageId) {
                return;
            }

            this.storeService.getImageContent(imageId).then(image => {
                this.setBackgroundImage(image.content);
            }).catch((e) => {
                console.error(e);
            });
        });
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

    close() {
        this.storeService.setViewedImageId(null);
    }

    private setBackgroundImage(...urls: string[]) {
        this.backgroundImage = urls.map(url => `url('${url}')`).join(', ');
    }
}
