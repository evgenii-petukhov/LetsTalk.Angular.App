import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { StoreService } from 'src/app/services/store.service';

@Component({
    selector: 'app-image',
    templateUrl: './image.component.html',
    styleUrls: ['./image.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImageComponent implements OnInit {
    @Input() imageId: number;
    url: string;
    isLoading = true;

    constructor(
        private storeService: StoreService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        if (!this.imageId) {
            return;
        }
        this.storeService.getImageContent(this.imageId).then(content => {
            this.url = content;
            this.isLoading = false;
            this.cdr.detectChanges();
        }).catch(e => {
            console.error(e);
        });
    }
}
