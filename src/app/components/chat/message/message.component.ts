import { Component, Input, signal } from '@angular/core';
import { Message } from 'src/app/models/message';

@Component({
    selector: 'app-message',
    templateUrl: './message.component.html',
    styleUrls: ['./message.component.scss'],
    standalone: false,
})
export class MessageComponent {
    @Input() message: Message;

    isImageError = signal(false);

    onImageError() {
        this.isImageError.set(true);
    }
}
