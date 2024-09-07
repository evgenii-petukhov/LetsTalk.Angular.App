import { Component, EventEmitter, Output } from '@angular/core';
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-back-button',
    templateUrl: './back-button.component.html',
    styleUrl: './back-button.component.scss',
})
export class BackButtonComponent {
    faChevronLeft = faChevronLeft;
    @Output() buttonClick = new EventEmitter();

    onButtonClicked(): void {
        this.buttonClick.emit();
    }
}
