import { Component, EventEmitter, Output } from '@angular/core';
import { faRightFromBracket } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-logout-button',
    templateUrl: './logout-button.component.html',
    styleUrl: './logout-button.component.scss',
})
export class LogoutButtonComponent {
    faRightFromBracket = faRightFromBracket;
    @Output() click = new EventEmitter<void>();

    onButtonClicked(): boolean {
        this.click.emit();
        return false;
    }
}
