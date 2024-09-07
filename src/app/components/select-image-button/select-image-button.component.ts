import { Component, EventEmitter, Output } from '@angular/core';
import { faCamera } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-select-image-button',
    templateUrl: './select-image-button.component.html',
    styleUrl: './select-image-button.component.scss',
})
export class SelectImageButtonComponent {
    faCamera = faCamera;
    @Output() imageBufferReady = new EventEmitter<ArrayBuffer>();

    async onImageSelected(event: Event): Promise<void> {
        const eventTarget = event.target as HTMLInputElement;
        if (eventTarget.files && eventTarget.files.length) {
            const buffer = await eventTarget.files[0].arrayBuffer();
            this.imageBufferReady.emit(buffer);
        }
        eventTarget.value = null;
    }
}
