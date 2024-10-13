import { Component, EventEmitter, Output } from '@angular/core';
import { faCamera } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-select-image-button',
    template: '<div></div>',
})
export class SelectImageButtonStubComponent {
    faCamera = faCamera;
    @Output() imageBlobReady = new EventEmitter<Blob>();
}
