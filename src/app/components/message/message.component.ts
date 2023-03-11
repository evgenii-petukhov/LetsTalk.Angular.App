import { Component, Input } from '@angular/core';
import { IMessageDto } from 'src/app/api-client/api-client';

@Component({
    selector: 'app-message',
    templateUrl: './message.component.html',
    styleUrls: ['./message.component.scss']
})
export class MessageComponent {
    @Input() message: IMessageDto;

    offset = new Date().getTimezoneOffset();
}
