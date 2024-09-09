import { Component, EventEmitter, Output } from '@angular/core';
import { faCamera } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-select-image-button',
    templateUrl: './select-image-button.component.html',
    styleUrl: './select-image-button.component.scss',
})
export class SelectImageButtonComponent {
    faCamera = faCamera;
    @Output() imageBlobReady = new EventEmitter<Blob>();

    onImageSelected(event: Event): void {
        const eventTarget = event.target as HTMLInputElement;
        if (eventTarget.files && eventTarget.files.length) {
            this.imageBlobReady.emit(eventTarget.files[0]);
        }
        eventTarget.value = null;
    }
}
