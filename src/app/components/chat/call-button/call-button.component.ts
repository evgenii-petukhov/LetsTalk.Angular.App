import { Component, EventEmitter, Input, Output } from '@angular/core';
import { faPhone } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-call-button',
    templateUrl: './call-button.component.html',
    styleUrl: './call-button.component.scss',
    standalone: false,
})
export class CallButtonComponent {
    faPhone = faPhone;
    @Input() mode: 'start-call' | 'end-call' = 'start-call';
    @Output() buttonClick = new EventEmitter();

    onButtonClicked(): void {
        this.buttonClick.emit();
    }
}
