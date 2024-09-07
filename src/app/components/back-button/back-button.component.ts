import { Component, EventEmitter, Output } from '@angular/core';
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-back-button',
    templateUrl: './back-button.component.html',
    styleUrl: './back-button.component.scss',
})
export class BackButtonComponent {
    faChevronLeft = faChevronLeft;
    @Output() click = new EventEmitter<void>();

    onButtonClicked(): boolean {
        this.click.emit();
        return false;
    }
}
