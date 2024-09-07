import { Component, EventEmitter, Input, Output } from '@angular/core';
import { faPaperPlane } from '@fortawesome/free-regular-svg-icons';

@Component({
    selector: 'app-send-message-button',
    templateUrl: './send-message-button.component.html',
    styleUrl: './send-message-button.component.scss',
})
export class SendMessageButtonComponent {
    faPaperPlane = faPaperPlane;
    @Input() disabled = false;
    @Output() buttonClick = new EventEmitter();

    onButtonClicked(): void {
        this.buttonClick.emit();
    }
}
