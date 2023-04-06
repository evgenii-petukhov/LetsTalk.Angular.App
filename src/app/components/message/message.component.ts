import { Component, Input } from '@angular/core';
import { Message } from 'src/app/models/message';

@Component({
    selector: 'app-message',
    templateUrl: './message.component.html',
    styleUrls: ['./message.component.scss'],
    styles: [
        ':host ::ng-deep .text p { margin: 0; }'
    ],
})
export class MessageComponent {
    @Input() message: Message;

    isImageError = false;

    onImageError(event){
        this.isImageError = true;
    }
}
