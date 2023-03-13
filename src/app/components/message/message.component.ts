import { Component, Input } from '@angular/core';
import { IMessageDto } from 'src/app/api-client/api-client';
import { DateTimeService } from 'src/app/services/date-time.service';

@Component({
    selector: 'app-message',
    templateUrl: './message.component.html',
    styleUrls: ['./message.component.scss']
})
export class MessageComponent {
    @Input() message: IMessageDto;

    timezone = this.dateTimeService.getTimezone();

    constructor(
        private dateTimeService: DateTimeService
    ) {}
}
