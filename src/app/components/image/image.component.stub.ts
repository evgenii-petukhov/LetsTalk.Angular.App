import { Component, Input } from '@angular/core';
import { ImagePreview } from 'src/app/models/imagePreview';

@Component({
    selector: 'app-image',
    template: '<div></div>'
})
export class ImageStubComponent {
    @Input() imagePreview: ImagePreview;
    @Input() imageId: string;
}
