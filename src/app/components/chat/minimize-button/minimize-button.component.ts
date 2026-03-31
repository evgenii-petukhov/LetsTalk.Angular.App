import { Component, EventEmitter, Output } from '@angular/core';
import { faDownLeftAndUpRightToCenter } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-minimize-button',
    templateUrl: './minimize-button.component.html',
    styleUrl: './minimize-button.component.scss',
    standalone: false,
})
export class MinimizeButtonComponent {
    icon = faDownLeftAndUpRightToCenter;
    @Output() buttonClick = new EventEmitter<MouseEvent>();

    onButtonClicked(event: MouseEvent): void {
        this.buttonClick.emit(event);
    }
}
