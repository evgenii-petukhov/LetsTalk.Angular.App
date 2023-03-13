import { Component, Input } from '@angular/core';
import { Message } from 'src/app/models/message';
import { DateTimeService } from 'src/app/services/date-time.service';

@Component({
    selector: 'app-message',
    templateUrl: './message.component.html',
    styleUrls: ['./message.component.scss']
})
export class MessageComponent {
    @Input() message: Message;

    timezone = this.dateTimeService.getLocalTimezone();

    constructor(
        private dateTimeService: DateTimeService
    ) {}
}
