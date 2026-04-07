import { Component, EventEmitter, Output } from '@angular/core';
import { faCameraRotate } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-camera-rotate-button',
    templateUrl: './camera-rotate-button.component.html',
    styleUrl: './camera-rotate-button.component.scss',
    standalone: false,
})
export class CameraRotateButtonComponent {
    icon = faCameraRotate;
    @Output() buttonClick = new EventEmitter<MouseEvent>();

    onButtonClicked(event: MouseEvent): void {
        this.buttonClick.emit(event);
    }
}
